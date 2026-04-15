import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";
import { calculateOrderTotals } from "../../utils/orderHelper.js";
import { finalizeOrder } from "../../utils/orderFinalizer.js";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Prepare Razorpay Order (Modal First) ──────────────────
export const prepareRazorpayOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      address_id,
      coupon_id,
      use_loyalty_points,
      discount_amount,
      notes = null,
    } = req.body;

    // 1. Calculate Totals and Verify Stock
    let orderDetails;
    try {
      orderDetails = await calculateOrderTotals(userId, {
        address_id,
        coupon_id,
        use_loyalty_points,
        clientDiscount: discount_amount,
      });
    } catch (e) {
      return error(res, e.message, 400);
    }

    // 2. Create Razorpay Order
    const options = {
      amount: Math.round(orderDetails.totalAmount * 100), // paise
      currency: "INR",
      receipt: `temp_receipt_${Date.now()}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    // 3. Save Temporary Order Data
    // We store the full order metadata so we can reconstruct it during verification
    const tempOrderId = rzpOrder.id; // Using RZP order ID as our temp key
    await pool.query(
      `INSERT INTO temporary_orders (id, user_id, order_data, amount, razorpay_order_id)
         VALUES (?, ?, ?, ?, ?)`,
      [
        tempOrderId,
        userId,
        JSON.stringify({ options, orderDetails, notes }),
        orderDetails.totalAmount,
        rzpOrder.id,
      ],
    );

    return success(
      res,
      {
        razorpay_order_id: rzpOrder.id,
        amount: options.amount,
        currency: options.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
      "Payment initiated.",
    );
  } catch (err) {
    console.error("Razorpay Prepare Error:", err);
    return error(res, "Failed to initiate payment.", 500);
  }
};

// ── Verify and Place Order (Confirm Success) ──────────────
export const verifyAndPlaceOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    console.log(`📡 Verifying payment for RZP Order: ${razorpay_order_id}`);

    const userId = req.user.id;

    // 1. Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Invalid Signature");
      return error(res, "Invalid payment signature.", 400);
    }

    // 2. Fetch Temporary Order Data
    const [tempRows] = await conn.query(
      "SELECT order_data FROM temporary_orders WHERE id = ? AND user_id = ?",
      [razorpay_order_id, userId],
    );

    if (tempRows.length === 0) {
      // Checking if order was already finalized by webhook or auto-sync
      const [existingOrder] = await conn.query(
        "SELECT id FROM orders WHERE razorpay_order_id = ?",
        [razorpay_order_id],
      );
      if (existingOrder.length > 0) {
        console.log("✅ Order already finalized exists.");
        return success(
          res,
          { order_id: existingOrder[0].id },
          "Order already finalized.",
        );
      }
      console.error("❌ Temp order not found");
      return error(res, "Order session not found.", 404);
    }

    // Handle both JSON string and object cases (MySQL might auto-parse JSON)
    let orderData = tempRows[0].order_data;
    if (typeof orderData === "string") {
      orderData = JSON.parse(orderData);
    }
    const { orderDetails, notes } = orderData;

    // 3. Finalize Order (Within Transaction)
    await conn.beginTransaction();
    console.log("📝 Finalizing order in database...");

    const result = await finalizeOrder(
      userId,
      orderDetails,
      {
        payment_mode: "online",
        payment_status: "paid",
        razorpay_order_id,
        razorpay_payment_id,
      },
      notes,
      conn,
    );

    // 4. Cleanup Temp Order
    await conn.query("DELETE FROM temporary_orders WHERE id = ?", [
      razorpay_order_id,
    ]);

    await conn.commit();
    console.log("✅ Order finalized successfully!");

    return success(res, result, "Order placed successfully! 🎉");
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("❌ Payment Finalization Error:", err);
    return error(res, "An error occurred while finalizing your order.", 500);
  } finally {
    if (conn) conn.release();
  }
};

/**
 * Syncs temporary orders for a user by checking Razorpay status.
 * Used as a fallback when Webhooks are not available.
 */
export const syncUserPayments = async (userId) => {
  try {
    const [tempOrders] = await pool.query(
      "SELECT id, order_data FROM temporary_orders WHERE user_id = ?",
      [userId],
    );

    if (tempOrders.length === 0) return;

    console.log(
      `🔍 Checking ${tempOrders.length} pending session for user: ${userId}`,
    );

    for (const temp of tempOrders) {
      const rzpOrderId = temp.id;

      // Handle both JSON string and object cases
      let orderData = temp.order_data;
      if (typeof orderData === "string") {
        orderData = JSON.parse(orderData);
      }
      const { orderDetails, notes } = orderData;

      // 1. Fetch payments for this RZP Order
      const payments = await razorpay.orders.fetchPayments(rzpOrderId);

      // 2. Check for successful payments (Captured or Authorized)
      const successfulPayment = payments.items.find(
        (p) => p.status === "captured" || p.status === "authorized",
      );

      if (successfulPayment) {
        console.log(`✨ Auto-healing found a paid order: ${rzpOrderId}`);
        const conn = await pool.getConnection();
        try {
          await conn.beginTransaction();

          await finalizeOrder(
            userId,
            orderDetails,
            {
              payment_mode: "online",
              payment_status: "paid",
              razorpay_order_id: rzpOrderId,
              razorpay_payment_id: successfulPayment.id,
            },
            notes,
            conn,
          );

          await conn.query("DELETE FROM temporary_orders WHERE id = ?", [
            rzpOrderId,
          ]);
          await conn.commit();
        } catch (err) {
          await conn.rollback();
          console.error(`❌ Auto-healing failed for ${rzpOrderId}:`, err);
        } finally {
          conn.release();
        }
      }
    }
  } catch (err) {
    console.error("Sync Payments Error:", err);
  }
};
