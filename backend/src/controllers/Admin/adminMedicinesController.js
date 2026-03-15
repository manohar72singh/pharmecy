import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getMedicines = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, category } = req.query;
    const offset = (page - 1) * limit;
    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (m.name LIKE ? OR m.brand LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += " AND c.slug = ?";
      params.push(category);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM medicines m LEFT JOIN categories c ON m.category_id = c.id ${where}`,
      params,
    );

    const [rows] = await pool.query(
      `SELECT m.id, m.name, m.brand, m.pack_size, m.requires_prescription, m.is_active,
              c.name AS category_name,
              (SELECT image_url FROM medicine_images WHERE medicine_id = m.id AND is_primary = 1 LIMIT 1) AS image_url,
              COALESCE((SELECT SUM(available_quantity) FROM medicine_batches WHERE medicine_id = m.id AND batch_status = 'active'), 0) AS total_stock,
              (SELECT MIN(selling_price) FROM medicine_batches WHERE medicine_id = m.id AND batch_status = 'active') AS min_price
       FROM medicines m
       LEFT JOIN categories c ON m.category_id = c.id
       ${where}
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );

    return success(
      res,
      {
        medicines: rows,
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

export const toggleMedicineStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT is_active FROM medicines WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length) return error(res, "Medicine not found.", 404);
    await pool.query("UPDATE medicines SET is_active = ? WHERE id = ?", [
      rows[0].is_active ? 0 : 1,
      req.params.id,
    ]);
    return success(res, {}, "Status updated.");
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};
