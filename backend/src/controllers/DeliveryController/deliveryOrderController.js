import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get Assigned Orders ───────────────────────────────
export const getAssignedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    const [dbRows] = await pool.query(
      "SELECT id FROM delivery_boys WHERE user_id = ?",
      [req.user.id],
    );
    if (dbRows.length === 0)
      return error(res, "Delivery partner profile not found.", 404);

    const deliveryBoyId = dbRows[0].id;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total 
       FROM delivery_assignments da
       WHERE da.delivery_boy_id = ? AND da.otp_verified = 0`,
      [deliveryBoyId],
    );

    const [orders] = await pool.query(
      `SELECT
        o.id, o.order_number, o.order_status, o.payment_mode,
        o.payment_status, o.total_amount, o.created_at,
        da.id as assignment_id, da.delivery_otp, da.otp_verified, da.assigned_at,
        u.name as user_name, u.phone as user_phone,
        ca.full_name, ca.address_line1, ca.address_line2,
        ca.city, ca.state, ca.pincode,
        COUNT(oi.id) as item_count
       FROM delivery_assignments da
       JOIN orders o ON o.id = da.order_id
       JOIN users u ON u.id = o.user_id
       JOIN customer_addresses ca ON ca.id = o.address_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       WHERE da.delivery_boy_id = ? AND da.otp_verified = 0
       GROUP BY o.id, o.order_number, o.order_status, o.payment_mode,
                o.payment_status, o.total_amount, o.created_at,
                da.id, da.delivery_otp, da.otp_verified, da.assigned_at,
                u.name, u.phone,
                ca.full_name, ca.address_line1, ca.address_line2,
                ca.city, ca.state, ca.pincode
       ORDER BY da.assigned_at DESC
       LIMIT ? OFFSET ?`,
      [deliveryBoyId, parseInt(limit), parseInt(offset)],
    );

    return success(
      res,
      {
        orders,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
      "Assigned orders retrieved successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve assigned orders.", 500);
  }
};

// ── Get Single Order Detail ───────────────────────────
export const getOrderDetail = async (req, res) => {
  try {
    const [dbRows] = await pool.query(
      "SELECT id FROM delivery_boys WHERE user_id = ?",
      [req.user.id],
    );
    if (dbRows.length === 0)
      return error(res, "Delivery partner profile not found.", 404);

    const deliveryBoyId = dbRows[0].id;

    const [orderRows] = await pool.query(
      `SELECT
        o.id, o.order_number, o.order_status, o.payment_mode,
        o.payment_status, o.total_amount, o.discount_amount,
        o.delivery_charge, o.created_at,
        da.delivery_otp, da.otp_verified, da.assigned_at,
        u.name as user_name, u.phone as user_phone,
        ca.full_name, ca.address_line1, ca.address_line2,
        ca.city, ca.state, ca.pincode, ca.phone as address_phone
       FROM delivery_assignments da
       JOIN orders o ON o.id = da.order_id
       JOIN users u ON u.id = o.user_id
       JOIN customer_addresses ca ON ca.id = o.address_id
       WHERE da.order_id = ? AND da.delivery_boy_id = ?`,
      [req.params.id, deliveryBoyId],
    );

    if (orderRows.length === 0) return error(res, "Order not found.", 404);

    const [items] = await pool.query(
      `SELECT
        oi.quantity, oi.unit_price,
        m.name as medicine_name, m.pack_size
       FROM order_items oi
       JOIN medicines m ON m.id = oi.medicine_id
       WHERE oi.order_id = ?`,
      [req.params.id],
    );

    return success(
      res,
      { ...orderRows[0], items },
      "Order details retrieved successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve order details.", 500);
  }
};

// ── Verify OTP → Mark as Delivered ───────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return error(res, "Please enter the OTP.", 400);

    const [dbRows] = await pool.query(
      "SELECT id FROM delivery_boys WHERE user_id = ?",
      [req.user.id],
    );
    if (dbRows.length === 0)
      return error(res, "Delivery partner profile not found.", 404);

    const deliveryBoyId = dbRows[0].id;

    const [assignment] = await pool.query(
      `SELECT id, delivery_otp, otp_verified
       FROM delivery_assignments
       WHERE order_id = ? AND delivery_boy_id = ?`,
      [req.params.id, deliveryBoyId],
    );

    if (assignment.length === 0)
      return error(res, "Delivery assignment not found.", 404);

    if (assignment[0].otp_verified)
      return error(res, "This order has already been delivered.", 400);

    if (assignment[0].delivery_otp !== otp.toString())
      return error(res, "Invalid OTP! Please try again.", 400);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        "UPDATE delivery_assignments SET otp_verified = 1, delivered_at = NOW() WHERE id = ?",
        [assignment[0].id],
      );

      await conn.query(
        "UPDATE orders SET order_status = 'delivered' WHERE id = ?",
        [req.params.id],
      );

      await conn.query(
        "UPDATE delivery_boys SET total_deliveries = total_deliveries + 1 WHERE user_id = ?",
        [req.user.id],
      );

      await conn.query(
        "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
        [req.params.id, "delivered", req.user.id],
      );

      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }

    return success(
      res,
      { order_id: req.params.id },
      "Order delivered successfully! OTP verified. ",
    );
  } catch (err) {
    console.error(err);
    return error(res, "OTP verification failed.", 500);
  }
};
