import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { generateOTP, getOTPExpiry } from "../utils/otp.js";
import { success, error } from "../utils/response.js";

// ── Register ──────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password)
      return error(res, "Name, phone aur password zaroori hai.", 400);

    const [existing] = await pool.query(
      "SELECT id, is_verified FROM users WHERE phone = ?",
      [phone],
    );

    const otp = generateOTP();
    const otp_expiry = getOTPExpiry();

    if (existing.length > 0) {
      // ── Agar user exist karta hai but verified nahi ──
      // Unhe naya OTP de do (re-register attempt)
      if (!existing[0].is_verified) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await pool.query(
          `UPDATE users SET name=?, email=?, password=?, otp_code=?, otp_expires_at=? WHERE phone=?`,
          [name, email || null, hashedPassword, otp, otp_expiry, phone],
        );
        console.log(`📱 OTP for ${phone}: ${otp}`);
        return success(
          res,
          { phone },
          "OTP sent. Please verify your phone.",
          200,
        );
      }
      return error(res, "Phone number already registered.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Naya user — is_verified = FALSE by default ──
    const [result] = await pool.query(
      `INSERT INTO users (role_id, name, phone, email, password, otp_code, otp_expires_at, is_verified)
       VALUES (5, ?, ?, ?, ?, ?, ?, FALSE)`,
      [name, phone, email || null, hashedPassword, otp, otp_expiry],
    );

    // TODO: SMS bhejo yahan (Twilio / MSG91)
    console.log(`📱 OTP for ${phone}: ${otp}`);

    return success(
      res,
      { user_id: result.insertId, phone },
      "OTP sent to your phone. Please verify.",
      201,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Registration failed.", 500);
  }
};

// ── Verify OTP ────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) return error(res, "Phone aur OTP zaroori hai.", 400);

    const [rows] = await pool.query("SELECT * FROM users WHERE phone = ?", [
      phone,
    ]);
    if (rows.length === 0) return error(res, "User not found.", 404);

    const user = rows[0];

    // Pehle se verified hai?
    if (user.is_verified)
      return error(res, "Phone already verified hai. Login karein.", 400);

    // OTP match — dono ko String mein compare karo
    if (String(user.otp_code).trim() !== String(otp).trim())
      return error(res, "Invalid OTP. Dobara check karein.", 400);

    // OTP expired?
    if (new Date() > new Date(user.otp_expires_at))
      return error(res, "OTP expire ho gaya. Resend karein.", 400);

    // ✅ Verify karo
    await pool.query(
      "UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = ?",
      [user.id],
    );

    // Role fetch karo
    const [roleRows] = await pool.query(
      "SELECT role_name FROM user_roles WHERE id = ?",
      [user.role_id],
    );
    const role_name = roleRows[0]?.role_name || "customer";

    const token = generateToken({
      id: user.id,
      role_id: user.role_id,
      role_name,
      name: user.name,
    });

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: role_name,
        },
      },
      "Phone verified! Account ready hai.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "OTP verification failed.", 500);
  }
};

// ── Login ─────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const [rows] = await pool.query(
      `SELECT u.*, r.role_name FROM users u
       JOIN user_roles r ON u.role_id = r.id
       WHERE u.phone = ?`,
      [phone],
    );
    if (rows.length === 0) return error(res, "Invalid phone or password.", 401);

    const user = rows[0];

    if (!user.is_active)
      return error(res, "Account deactivated. Contact support.", 403);

    if (!user.is_verified)
      return error(res, "Phone verify nahi hai. Pehle OTP verify karein.", 403);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, "Invalid phone or password.", 401);

    await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    const token = generateToken({
      id: user.id,
      role_id: user.role_id,
      role_name: user.role_name,
      name: user.name,
    });

    return success(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role_name,
        },
      },
      "Login successful.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Login failed.", 500);
  }
};

// ── Resend OTP ────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return error(res, "Phone number zaroori hai.", 400);

    const [rows] = await pool.query(
      "SELECT id, is_verified FROM users WHERE phone = ?",
      [phone],
    );
    if (rows.length === 0) return error(res, "User not found.", 404);

    if (rows[0].is_verified)
      return error(res, "Phone already verified hai.", 400);

    const otp = generateOTP();
    const otp_expiry = getOTPExpiry();

    await pool.query(
      "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE phone = ?",
      [otp, otp_expiry, phone],
    );

    // TODO: SMS bhejo yahan
    console.log(`📱 Resent OTP for ${phone}: ${otp}`);

    return success(res, {}, "OTP resent successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to resend OTP.", 500);
  }
};

// ── Get Me ────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, u.profile_image,
              u.date_of_birth, u.gender, u.is_verified, u.created_at, r.role_name
       FROM users u JOIN user_roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id],
    );
    if (rows.length === 0) return error(res, "User not found.", 404);
    return success(res, rows[0], "User fetched successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch user.", 500);
  }
};

// ── Change Password ───────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      req.user.id,
    ]);
    if (rows.length === 0) return error(res, "User not found.", 404);

    const isMatch = await bcrypt.compare(old_password, rows[0].password);
    if (!isMatch) return error(res, "Old password is incorrect.", 400);

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      req.user.id,
    ]);

    return success(res, {}, "Password changed successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to change password.", 500);
  }
};
