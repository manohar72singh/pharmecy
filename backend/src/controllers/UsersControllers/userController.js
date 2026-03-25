import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";
import { success, error } from "../../utils/response.js";

// ── Get Profile ───────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, u.profile_image,
              u.date_of_birth, u.gender, u.is_verified, u.created_at,
              r.role_name
       FROM users u
       JOIN user_roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id],
    );
    if (rows.length === 0) return error(res, "User profile not found.", 404);
    return success(res, rows[0], "Profile retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve profile.", 500);
  }
};

// ── Update Profile ────────────────────────────────────
// export const updateProfile = async (req, res) => {
//   try {
//     const { name, email, date_of_birth, gender } = req.body;

//     if (!name) return error(res, "Name is required.", 400);

//     // Email unique check
//     if (email) {
//       const [existing] = await pool.query(
//         "SELECT id FROM users WHERE email = ? AND id != ?",
//         [email, req.user.id],
//       );
//       if (existing.length > 0)
//         return error(res, "This email address is already in use.", 409);
//     }

//     await pool.query(
//       `UPDATE users SET name=?, email=?, date_of_birth=?, gender=? WHERE id=?`,
//       [name, email || null, date_of_birth || null, gender || null, req.user.id],
//     );

//     const [updated] = await pool.query(
//       "SELECT id, name, phone, email, profile_image, date_of_birth, gender FROM users WHERE id=?",
//       [req.user.id],
//     );

//     return success(res, updated[0], "Profile updated successfully.");
//   } catch (err) {
//     console.error(err);
//     return error(res, "Failed to update profile.", 500);
//   }
// };
export const updateProfile = async (req, res) => {
  try {
    let { name, email, date_of_birth, gender } = req.body;

    if (!name) return error(res, "Name is required.", 400);

    // ✅ Normalize gender (VERY IMPORTANT)
    if (gender) {
      gender = gender.toLowerCase();

      const allowedGenders = ["male", "female", "other"];
      if (!allowedGenders.includes(gender)) {
        return error(res, "Invalid gender value.", 400);
      }
    }

    // ✅ Email unique check
    if (email) {
      const [existing] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?",
        [email, req.user.id]
      );

      if (existing.length > 0) {
        return error(res, "This email address is already in use.", 409);
      }
    }

    // ✅ Update query
    await pool.query(
      `UPDATE users 
       SET name=?, email=?, date_of_birth=?, gender=? 
       WHERE id=?`,
      [
        name,
        email || null,
        date_of_birth || null,
        gender || null,
        req.user.id,
      ]
    );

    // ✅ Fetch updated user
    const [updated] = await pool.query(
      `SELECT id, name, phone, email, profile_image, date_of_birth, gender 
       FROM users WHERE id=?`,
      [req.user.id]
    );

    return success(res, updated[0], "Profile updated successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update profile.", 500);
  }
};
// ── Upload Profile Photo ──────────────────────────────
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return error(res, "Please upload a photo.", 400);

    // Delete old photo
    const [user] = await pool.query(
      "SELECT profile_image FROM users WHERE id=?",
      [req.user.id],
    );
    if (user[0]?.profile_image) {
      const oldPath = path.join("uploads", user[0].profile_image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const imageUrl = req.file.filename;
    await pool.query("UPDATE users SET profile_image=? WHERE id=?", [
      imageUrl,
      req.user.id,
    ]);

    return success(
      res,
      { profile_image: imageUrl },
      "Profile photo updated successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to upload photo.", 500);
  }
};

// ── Change Password ───────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password)
      return error(res, "Both current and new passwords are required.", 400);

    if (new_password.length < 6)
      return error(
        res,
        "New password must be at least 6 characters long.",
        400,
      );

    const [rows] = await pool.query("SELECT password FROM users WHERE id=?", [
      req.user.id,
    ]);
    if (rows.length === 0) return error(res, "User record not found.", 404);

    const isMatch = await bcrypt.compare(old_password, rows[0].password);
    if (!isMatch) return error(res, "Current password is incorrect.", 400);

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query("UPDATE users SET password=? WHERE id=?", [
      hashed,
      req.user.id,
    ]);

    return success(res, {}, "Password changed successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to change password.", 500);
  }
};
