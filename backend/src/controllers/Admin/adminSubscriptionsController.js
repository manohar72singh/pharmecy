import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const offset = (page - 1) * limit;
    let where = "WHERE 1=1";
    const params = [];
    if (status) {
      where += " AND s.status = ?";
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM subscriptions s ${where}`,
      params,
    );
    const [rows] = await pool.query(
      `SELECT s.*, u.name AS user_name, u.phone AS user_phone,
              sp.name AS plan_name, sp.frequency, sp.discount_percent,
              ca.city, ca.address_line1
       FROM subscriptions s
       JOIN users u ON s.user_id = u.id
       JOIN subscription_plans sp ON s.plan_id = sp.id
       JOIN customer_addresses ca ON s.address_id = ca.id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        subscriptions: rows,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
      "Fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};
