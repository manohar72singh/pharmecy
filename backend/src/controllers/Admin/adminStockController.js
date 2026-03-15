import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getStock = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, low_stock } = req.query;
    const offset = (page - 1) * limit;
    let where = "WHERE mb.batch_status = 'active'";
    const params = [];
    if (search) {
      where += " AND (m.name LIKE ? OR mb.batch_no LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (low_stock === "true") {
      where += " AND mb.available_quantity <= 10";
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM medicine_batches mb JOIN medicines m ON mb.medicine_id = m.id ${where}`,
      params,
    );
    const [rows] = await pool.query(
      `SELECT mb.id, mb.batch_no, mb.available_quantity, mb.selling_price, mb.mrp,
              mb.expiry_date, mb.batch_status,
              m.id AS medicine_id, m.name AS medicine_name, m.brand,
              s.name AS supplier_name
       FROM medicine_batches mb
       JOIN medicines m ON mb.medicine_id = m.id
       LEFT JOIN suppliers s ON mb.supplier_id = s.id
       ${where}
       ORDER BY mb.available_quantity ASC, mb.expiry_date ASC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        stock: rows,
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

export const updateStock = async (req, res) => {
  try {
    const { available_quantity } = req.body;
    await pool.query(
      "UPDATE medicine_batches SET available_quantity = ? WHERE id = ?",
      [available_quantity, req.params.id],
    );
    return success(res, {}, "Stock updated.");
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};
