import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get Earnings Summary ──────────────────────────────
export const getEarnings = async (req, res) => {
  try {
    const [dbRows] = await pool.query(
      "SELECT id FROM delivery_boys WHERE user_id = ?",
      [req.user.id],
    );
    if (dbRows.length === 0) return error(res, "Delivery boy nahi mila.", 404);

    const deliveryBoyId = dbRows[0].id;

    const [[today]] = await pool.query(
      `SELECT COUNT(*) as count FROM delivery_assignments
       WHERE delivery_boy_id = ? AND otp_verified = 1
         AND DATE(delivered_at) = CURDATE()`,
      [deliveryBoyId],
    );

    const [[thisWeek]] = await pool.query(
      `SELECT COUNT(*) as count FROM delivery_assignments
       WHERE delivery_boy_id = ? AND otp_verified = 1
         AND delivered_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`,
      [deliveryBoyId],
    );

    const [[thisMonth]] = await pool.query(
      `SELECT COUNT(*) as count FROM delivery_assignments
       WHERE delivery_boy_id = ? AND otp_verified = 1
         AND MONTH(delivered_at) = MONTH(CURDATE())
         AND YEAR(delivered_at) = YEAR(CURDATE())`,
      [deliveryBoyId],
    );

    const [[total]] = await pool.query(
      `SELECT COUNT(*) as count FROM delivery_assignments
       WHERE delivery_boy_id = ? AND otp_verified = 1`,
      [deliveryBoyId],
    );

    return success(
      res,
      {
        today: today.count,
        this_week: thisWeek.count,
        this_month: thisMonth.count,
        total: total.count,
      },
      "Earnings fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

// ── Get Delivery History ──────────────────────────────
export const getDeliveryHistory = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    const [dbRows] = await pool.query(
      "SELECT id FROM delivery_boys WHERE user_id = ?",
      [req.user.id],
    );
    if (dbRows.length === 0) return error(res, "Delivery boy nahi mila.", 404);

    const deliveryBoyId = dbRows[0].id;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM delivery_assignments
       WHERE delivery_boy_id = ? AND otp_verified = 1`,
      [deliveryBoyId],
    );

    const [history] = await pool.query(
      `SELECT
        da.id as assignment_id, da.delivered_at,
        o.id as order_id, o.order_number, o.total_amount,
        o.payment_mode, o.payment_status,
        u.name as user_name, u.phone as user_phone,
        ca.city, ca.pincode
       FROM delivery_assignments da
       JOIN orders o ON o.id = da.order_id
       JOIN users u ON u.id = o.user_id
       JOIN customer_addresses ca ON ca.id = o.address_id
       WHERE da.delivery_boy_id = ? AND da.otp_verified = 1
       ORDER BY da.delivered_at DESC
       LIMIT ? OFFSET ?`,
      [deliveryBoyId, parseInt(limit), parseInt(offset)],
    );

    return success(
      res,
      {
        history,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
      "History fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};
