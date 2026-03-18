import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get Delivery Boy Profile ──────────────────────────
export const getDeliveryProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        u.id, u.name, u.phone, u.email, u.profile_image,
        db.id as delivery_boy_id, db.vehicle_type, db.is_available,
        db.created_at as joined_at
       FROM users u
       JOIN delivery_boys db ON db.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id],
    );

    if (rows.length === 0)
      return error(res, "Delivery boy profile nahi mila.", 404);

    return success(res, rows[0], "Profile fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

// ── Toggle Availability (Online / Offline) ────────────
export const toggleAvailability = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT is_available FROM delivery_boys WHERE user_id = ?",
      [req.user.id],
    );

    if (rows.length === 0) return error(res, "Delivery boy nahi mila.", 404);

    const newStatus = rows[0].is_available ? 0 : 1;

    await pool.query(
      "UPDATE delivery_boys SET is_available = ? WHERE user_id = ?",
      [newStatus, req.user.id],
    );

    return success(
      res,
      { is_available: newStatus },
      newStatus ? "Ab aap Online hain! 🟢" : "Ab aap Offline hain. 🔴",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};
