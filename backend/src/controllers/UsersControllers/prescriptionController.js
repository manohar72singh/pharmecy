import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get My Prescriptions ──────────────────────────────
export const getMyPrescriptions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*,
              u.name AS verified_by_name
       FROM prescriptions p
       LEFT JOIN users u ON p.verified_by = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );
    return success(res, rows, "Prescriptions fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

// ── Upload Prescription ───────────────────────────────
export const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) return error(res, "Prescription image upload karo.", 400);

    const imageUrl = req.file.filename;
    const { notes } = req.body;

    const [result] = await pool.query(
      `INSERT INTO prescriptions (user_id, image_url, status, notes)
       VALUES (?, ?, 'pending', ?)`,
      [req.user.id, imageUrl, notes || null],
    );

    return success(
      res,
      {
        id: result.insertId,
        image_url: imageUrl,
        status: "pending",
      },
      "Prescription upload ho gayi! Admin verify karega. ✅",
      201,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Upload failed.", 500);
  }
};

// ── Delete Prescription ───────────────────────────────
export const deletePrescription = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM prescriptions WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (!rows.length) return error(res, "Prescription nahi mili.", 404);
    if (rows[0].status === "approved")
      return error(res, "Approved prescription delete nahi ho sakti.", 400);

    await pool.query(`DELETE FROM prescriptions WHERE id = ?`, [req.params.id]);
    return success(res, {}, "Prescription delete ho gayi.");
  } catch (err) {
    console.error(err);
    return error(res, "Delete failed.", 500);
  }
};
