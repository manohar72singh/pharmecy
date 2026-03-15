import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getStats = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [[orders]] = await pool.query(`SELECT COUNT(*) as cnt FROM orders`);
    const [[users]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM users WHERE role_id = (SELECT id FROM user_roles WHERE role_name = 'customer')`,
    );
    const [[medicines]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM medicines`,
    );
    const [[pendingOrders]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM orders WHERE order_status = 'placed'`,
    );
    const [[pendingRx]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM prescriptions WHERE status = 'pending'`,
    );
    const [[lowStock]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM medicine_batches WHERE available_quantity <= 10 AND batch_status = 'active'`,
    );
    const [[activeSubs]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM subscriptions WHERE status = 'active'`,
    );
    const [[todayOrders]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM orders WHERE DATE(created_at) = ?`,
      [today],
    );
    const [[todayRevenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE DATE(created_at) = ? AND order_status != 'cancelled'`,
      [today],
    );
    const [[todayUsers]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM users WHERE DATE(created_at) = ?`,
      [today],
    );
    const [[todayDelivered]] = await pool.query(
      `SELECT COUNT(*) as cnt FROM orders WHERE DATE(updated_at) = ? AND order_status = 'delivered'`,
      [today],
    );

    return success(
      res,
      {
        total_orders: orders.cnt,
        total_users: users.cnt,
        total_medicines: medicines.cnt,
        pending_orders: pendingOrders.cnt,
        pending_rx: pendingRx.cnt,
        low_stock: lowStock.cnt,
        active_subscriptions: activeSubs.cnt,
        today_orders: todayOrders.cnt,
        today_revenue: todayRevenue.total,
        today_users: todayUsers.cnt,
        today_delivered: todayDelivered.cnt,
      },
      "Stats fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Stats fetch failed.", 500);
  }
};

export const getRecentOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT o.id, o.order_number, o.order_status, o.total_amount, o.created_at,
             u.name AS user_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    return success(res, rows, "Recent orders fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};
