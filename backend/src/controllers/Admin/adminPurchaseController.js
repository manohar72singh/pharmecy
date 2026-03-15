import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM purchase_orders",
    );
    const [rows] = await pool.query(
      `SELECT po.*, s.name AS supplier_name,
              u.name AS created_by_name
       FROM purchase_orders po
       LEFT JOIN suppliers s ON po.supplier_id = s.id
       LEFT JOIN users u ON po.created_by = u.id
       ORDER BY po.created_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        orders: rows,
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
