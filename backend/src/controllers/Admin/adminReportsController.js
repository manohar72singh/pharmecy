import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter =
      from && to ? `AND DATE(o.created_at) BETWEEN '${from}' AND '${to}'` : "";

    const [[revenue]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE order_status != 'cancelled' ${dateFilter.replace("o.", "")}`,
    );
    const [[orders]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders WHERE 1=1 ${dateFilter.replace("o.", "")}`,
    );
    const [[delivered]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders WHERE order_status = 'delivered' ${dateFilter.replace("o.", "")}`,
    );
    const [[cancelled]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders WHERE order_status = 'cancelled' ${dateFilter.replace("o.", "")}`,
    );

    const [dailyRevenue] = await pool.query(`
      SELECT DATE(created_at) as date, 
             COUNT(*) as orders,
             SUM(total_amount) as revenue
      FROM orders WHERE order_status != 'cancelled'
      GROUP BY DATE(created_at)
      ORDER BY date DESC LIMIT 30
    `);

    const [topMedicines] = await pool.query(`
      SELECT m.name, m.brand, SUM(oi.quantity) as sold, SUM(oi.total_price) as revenue
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'cancelled'
      GROUP BY m.id ORDER BY sold DESC LIMIT 10
    `);

    const [categoryRevenue] = await pool.query(`
      SELECT c.name AS category, SUM(oi.total_price) as revenue, SUM(oi.quantity) as sold
      FROM order_items oi
      JOIN medicines m ON oi.medicine_id = m.id
      JOIN categories c ON m.category_id = c.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.order_status != 'cancelled'
      GROUP BY c.id ORDER BY revenue DESC
    `);

    return success(
      res,
      {
        summary: {
          revenue: revenue.total,
          orders: orders.total,
          delivered: delivered.total,
          cancelled: cancelled.total,
        },
        daily_revenue: dailyRevenue,
        top_medicines: topMedicines,
        category_revenue: categoryRevenue,
      },
      "Reports fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};
