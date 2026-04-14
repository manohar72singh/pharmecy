import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";
import { calculateOrderTotals } from "../../utils/orderHelper.js";
import { finalizeOrder } from "../../utils/orderFinalizer.js";
import { syncUserPayments } from "./razorpayController.js";

// ── Place Order ───────────────────────────────────────
export const placeOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const userId = req.user.id;
    const { 
        address_id, 
        payment_mode, 
        coupon_id, 
        discount_amount, 
        use_loyalty_points, 
        notes 
    } = req.body;

    if (payment_mode !== 'cod') {
        // Online and UPI are now handled by the Razorpay flow
        return error(res, "Only COD can be placed directly. For online payments, use the payment flow.", 400);
    }

    // 1. Calculate Totals
    let orderDetails;
    try {
        orderDetails = await calculateOrderTotals(userId, { 
            address_id, 
            coupon_id, 
            use_loyalty_points, 
            clientDiscount: discount_amount 
        }, conn);
    } catch (e) {
        return error(res, e.message, 400);
    }

    // 2. Finalize Order
    const result = await finalizeOrder(userId, orderDetails, { payment_mode, payment_status: 'pending' }, notes, conn);

    await conn.commit();

    return success(
      res,
      {
        ...result,
        loyalty_discount: orderDetails.loyaltyDiscount,
        earned_points: orderDetails.earnedPoints,
        order_status: "placed",
      },
      "Order placed successfully! 🎉",
      201,
    );
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return error(res, "Failed to place order. Please try again.", 500);
  } finally {
    conn.release();
  }
};

// ── Get My Orders ─────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    // 🛡️ Webhook Alternative: Sync any pending payments first
    await syncUserPayments(req.user.id);

    const [orders] = await pool.query(
      `SELECT o.id, o.order_number, o.order_status, o.order_type,
              o.payment_mode, o.payment_status,
              o.subtotal, o.delivery_charge, o.discount_amount, o.total_amount,
              o.created_at, o.estimated_delivery,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id],
    );
    return success(res, orders, "Orders retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve orders.", 500);
  }
};

// ── Get Order Detail ──────────────────────────────────
export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT o.*,
              ca.full_name, ca.phone AS addr_phone,
              ca.address_line1, ca.address_line2,
              ca.city, ca.state, ca.pincode,
              da.delivery_otp, da.otp_verified,
              dbu.name AS delivery_boy_name, dbu.phone AS delivery_boy_phone
       FROM orders o
       JOIN customer_addresses ca ON o.address_id = ca.id
       LEFT JOIN delivery_assignments da ON da.order_id = o.id
       LEFT JOIN delivery_boys db ON da.delivery_boy_id = db.id
       LEFT JOIN users dbu ON db.user_id = dbu.id
       WHERE o.id = ? AND o.user_id = ?`,
      [id, req.user.id],
    );
    if (orders.length === 0) return error(res, "Order not found.", 404);

    const [items] = await pool.query(
      `SELECT oi.id, oi.medicine_id, oi.quantity, oi.unit_price, oi.total_price,
              m.name, m.brand, m.pack_size,
              mi.image_url, c.slug AS category_slug
       FROM order_items oi
       JOIN medicines m ON oi.medicine_id = m.id
       LEFT JOIN (
         SELECT medicine_id, image_url FROM medicine_images WHERE is_primary = 1
       ) mi ON mi.medicine_id = m.id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE oi.order_id = ?`,
      [id],
    );

    const [history] = await pool.query(
      "SELECT status, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC",
      [id],
    );

    return success(
      res,
      { order: orders[0], items, history },
      "Order details retrieved successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve order details.", 500);
  }
};

// ── Cancel Order ──────────────────────────────────────
export const cancelOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { reason = "Cancelled by customer" } = req.body;

    const [orders] = await conn.query(
      "SELECT id, order_status FROM orders WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    if (orders.length === 0) return error(res, "Order not found.", 404);

    const cancelable = ["placed", "confirmed", "processing"];
    if (!cancelable.includes(orders[0].order_status))
      return error(
        res,
        `Order cannot be cancelled while in "${orders[0].order_status}" status.`,
        400,
      );

    const [items] = await conn.query(
      "SELECT batch_id, quantity FROM order_items WHERE order_id = ?",
      [id],
    );
    for (const item of items) {
      await conn.query(
        "UPDATE medicine_batches SET available_quantity = available_quantity + ? WHERE id = ?",
        [item.quantity, item.batch_id],
      );
    }

    await conn.query(
      "UPDATE orders SET order_status = ?, cancellation_reason = ? WHERE id = ?",
      ["cancelled", reason, id],
    );
    await conn.query(
      "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
      [id, "cancelled", req.user.id],
    );

    await conn.commit();
    return success(res, {}, "Order has been cancelled successfully.");
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return error(res, "An error occurred while cancelling the order.", 500);
  } finally {
    conn.release();
  }
};
