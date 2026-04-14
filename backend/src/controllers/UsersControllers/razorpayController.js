import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay Order ────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, order_id } = req.body;

    if (!amount || !order_id) {
      return error(res, "Amount and Order ID are required.", 400);
    }

    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_order_${order_id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update the local order with razorpay_order_id
    await pool.query(
      "UPDATE orders SET razorpay_order_id = ? WHERE id = ?",
      [razorpayOrder.id, order_id]
    );

    return success(res, {
      razorpay_order_id: razorpayOrder.id,
      amount: options.amount,
      currency: options.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    }, "Razorpay order created successfully.");
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    return error(res, "Failed to create Razorpay order.", 500);
  }
};

// ── Verify Razorpay Payment ──────────────────────────────
export const verifyPayment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await conn.beginTransaction();

      // 1. Update order status
      await conn.query(
        "UPDATE orders SET payment_status = 'paid', order_status = 'placed' WHERE id = ?",
        [order_id]
      );

      // 2. Insert into payments table
      const [orderRows] = await conn.query("SELECT user_id, total_amount FROM orders WHERE id = ?", [order_id]);
      const order = orderRows[0];

      await conn.query(
        `INSERT INTO payments 
          (order_id, user_id, amount, payment_mode, transaction_id, status, paid_at)
         VALUES (?, ?, ?, 'razorpay', ?, 'success', NOW())`,
        [order_id, order.user_id, order.total_amount, razorpay_payment_id]
      );

      // 3. Add to status history
      await conn.query(
        "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
        [order_id, "paid", order.user_id]
      );

      await conn.commit();

      return success(res, { order_id }, "Payment verified successfully! 🎉");
    } else {
      return error(res, "Invalid payment signature. Verification failed.", 400);
    }
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Payment Verification Error:", err);
    return error(res, "An error occurred during payment verification.", 500);
  } finally {
    if (conn) conn.release();
  }
};
