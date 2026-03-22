import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const offset = (page - 1) * limit;
    let where = "WHERE 1=1";
    const params = [];
    if (status) {
      where += " AND p.status = ?";
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM prescriptions p ${where}`,
      params,
    );
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS user_name, u.phone AS user_phone
       FROM prescriptions p
       JOIN users u ON p.user_id = u.id
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        prescriptions: rows,
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

export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { status, valid_until } = req.body;
    if (!["pending", "verified", "rejected"].includes(status))
      return error(res, "Invalid status.", 400);
    await pool.query(
      "UPDATE prescriptions SET status = ?, verified_by = ?, valid_until = ? WHERE id = ?",
      [status, req.user.id, valid_until || null, req.params.id],
    );
    return success(res, {}, "Prescription updated.");
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};
