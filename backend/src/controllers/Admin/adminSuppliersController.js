import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getSuppliers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search } = req.query;
    const offset = (page - 1) * limit;
    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM suppliers ${where}`,
      params,
    );
    const [rows] = await pool.query(
      `SELECT s.*, COUNT(mb.id) AS batch_count
       FROM suppliers s
       LEFT JOIN medicine_batches mb ON s.id = mb.supplier_id
       ${where}
       GROUP BY s.id
       ORDER BY s.id DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        suppliers: rows,
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

export const createSupplier = async (req, res) => {
  try {
    const { name, email, phone, address, gst_number } = req.body;
    if (!name) return error(res, "Name zaroori hai.", 400);
    const [result] = await pool.query(
      "INSERT INTO suppliers (name, email, phone, address, gst_number) VALUES (?, ?, ?, ?, ?)",
      [name, email || null, phone || null, address || null, gst_number || null],
    );
    return success(res, { id: result.insertId }, "Supplier created.", 201);
  } catch (err) {
    console.error(err);
    return error(res, "Create failed.", 500);
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    await pool.query("DELETE FROM suppliers WHERE id = ?", [req.params.id]);
    return success(res, {}, "Supplier deleted.");
  } catch (err) {
    console.error(err);
    return error(res, "Delete failed.", 500);
  }
};
