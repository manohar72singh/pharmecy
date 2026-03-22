// import pool from "../../config/db.js";
// import { success, error } from "../../utils/response.js";

// // ── Get My Prescriptions ──────────────────────────────
// export const getMyPrescriptions = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT p.*,
//               u.name AS verified_by_name
//        FROM prescriptions p
//        LEFT JOIN users u ON p.verified_by = u.id
//        WHERE p.user_id = ?
//        ORDER BY p.created_at DESC`,
//       [req.user.id],
//     );
//     return success(res, rows, "Prescriptions retrieved successfully.");
//   } catch (err) {
//     console.error(err);
//     return error(res, "Failed to retrieve prescriptions.", 500);
//   }
// };

// // ── Upload Prescription ───────────────────────────────
// export const uploadPrescription = async (req, res) => {
//   try {
//     if (!req.file)
//       return error(res, "Please upload a prescription image.", 400);

//     const imageUrl = req.file.filename;
//     const { notes } = req.body;

//     const [result] = await pool.query(
//       `INSERT INTO prescriptions (user_id, image_url, status, notes)
//        VALUES (?, ?, 'pending', ?)`,
//       [req.user.id, imageUrl, notes || null],
//     );

//     return success(
//       res,
//       {
//         id: result.insertId,
//         image_url: imageUrl,
//         status: "pending",
//       },
//       "Prescription uploaded successfully. It is now pending verification.",
//       201,
//     );
//   } catch (err) {
//     console.error(err);
//     return error(res, "Failed to upload prescription.", 500);
//   }
// };

// // ── Delete Prescription ───────────────────────────────
// export const deletePrescription = async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       `SELECT id, status FROM prescriptions WHERE id = ? AND user_id = ?`,
//       [req.params.id, req.user.id],
//     );
//     if (!rows.length) return error(res, "Prescription not found.", 404);

//     if (rows[0].status === "approved")
//       return error(res, "Approved prescriptions cannot be deleted.", 400);

//     await pool.query(`DELETE FROM prescriptions WHERE id = ?`, [req.params.id]);
//     return success(res, {}, "Prescription deleted successfully.");
//   } catch (err) {
//     console.error(err);
//     return error(res, "Failed to delete prescription.", 500);
//   }
// };
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
    return success(res, rows, "Prescriptions retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve prescriptions.", 500);
  }
};

// ── Upload Prescription ───────────────────────────────
export const uploadPrescription = async (req, res) => {
  try {
    if (!req.file)
      return error(res, "Please upload a prescription image.", 400);

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
      "Prescription uploaded successfully. It is now pending verification.",
      201,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to upload prescription.", 500);
  }
};

// ── Delete Prescription ───────────────────────────────
export const deletePrescription = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM prescriptions WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (!rows.length) return error(res, "Prescription not found.", 404);

    if (rows[0].status === "verified")
      return error(res, "Approved prescriptions cannot be deleted.", 400);

    await pool.query(`DELETE FROM prescriptions WHERE id = ?`, [req.params.id]);
    return success(res, {}, "Prescription deleted successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to delete prescription.", 500);
  }
};
