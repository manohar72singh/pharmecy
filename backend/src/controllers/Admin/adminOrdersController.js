import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];

    if (status) {
      where += " AND o.order_status = ?";
      params.push(status);
    }
    if (search) {
      where +=
        " AND (o.order_number LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${where}`,
      params,
    );

    const [orders] = await pool.query(
      `SELECT o.id, o.order_number, o.order_status, o.payment_mode, o.payment_status,
              o.total_amount, o.discount_amount, o.delivery_charge, o.created_at,
              u.name AS user_name, u.phone AS user_phone,
              COUNT(oi.id) AS item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       ${where}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );

    return success(
      res,
      {
        orders,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
      "Orders fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "placed",
      "confirmed",
      "processing",
      "packed",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status))
      return error(res, "Invalid status.", 400);

    await pool.query("UPDATE orders SET order_status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    await pool.query(
      "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
      [req.params.id, status, req.user.id],
    );
    return success(res, {}, "Status updated.");
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};
