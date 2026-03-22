import bcrypt from "bcryptjs";
import pool from "../../config/db.js";
import { generateToken } from "../../utils/jwt.js";
import { generateOTP, getOTPExpiry } from "../../utils/otp.js";
import { success, error } from "../../utils/response.js";

// ── Register ──────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password)
      return error(res, "Name, phone number, and password are required.", 400);

    const [existing] = await pool.query(
      "SELECT id, is_verified FROM users WHERE phone = ?",
      [phone],
    );

    const otp = generateOTP();
    const otp_expiry = getOTPExpiry();

    if (existing.length > 0) {
      // ── If user exists but is not verified ──
      if (!existing[0].is_verified) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await pool.query(
          `UPDATE users SET name=?, email=?, password=?, otp_code=?, otp_expires_at=? WHERE phone=?`,
          [name, email || null, hashedPassword, otp, otp_expiry, phone],
        );
        console.log(`📱 OTP for ${phone}: ${otp}`);
        return success(
          res,
          { phone, otp }, //  OTP visible in response (development mode)
          "OTP sent successfully. Please verify your phone number.",
          200,
        );
      }
      return error(res, "This phone number is already registered.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // ── New user — is_verified = FALSE by default ──
    const [result] = await pool.query(
      `INSERT INTO users (role_id, name, phone, email, password, otp_code, otp_expires_at, is_verified)
       VALUES (5, ?, ?, ?, ?, ?, ?, FALSE)`,
      [name, phone, email || null, hashedPassword, otp, otp_expiry],
    );

    console.log(`📱 OTP for ${phone}: ${otp}`);

    return success(
      res,
      { user_id: result.insertId, phone, otp }, // OTP visible in response (development mode)
      "OTP sent to your phone. Please verify to complete registration.",
      201,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Internal server error during registration.", 500);
  }
};

// ── Verify OTP ────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp)
      return error(res, "Phone number and OTP are required.", 400);

    const [rows] = await pool.query("SELECT * FROM users WHERE phone = ?", [
      phone,
    ]);
    if (rows.length === 0) return error(res, "User record not found.", 404);

    const user = rows[0];

    if (user.is_verified)
      return error(res, "Phone number is already verified. Please login.", 400);

    if (String(user.otp_code).trim() !== String(otp).trim())
      return error(res, "Invalid OTP code. Please check and try again.", 400);

    if (new Date() > new Date(user.otp_expires_at))
      return error(res, "OTP has expired. Please request a new one.", 400);

    //  Verify user
    await pool.query(
      "UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE id = ?",
      [user.id],
    );

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
      "Phone number verified successfully. Your account is ready.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Internal server error during OTP verification.", 500);
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
    if (rows.length === 0)
      return error(res, "Invalid phone number or password.", 401);

    const user = rows[0];

    if (!user.is_active)
      return error(
        res,
        "Your account has been deactivated. Please contact support.",
        403,
      );

    if (!user.is_verified)
      return error(
        res,
        "Phone number not verified. Please verify OTP first.",
        403,
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, "Invalid phone number or password.", 401);

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
    return error(res, "Internal server error during login.", 500);
  }
};

// ── Resend OTP ────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return error(res, "Phone number is required.", 400);

    const [rows] = await pool.query(
      "SELECT id, is_verified FROM users WHERE phone = ?",
      [phone],
    );
    if (rows.length === 0) return error(res, "User record not found.", 404);

    if (rows[0].is_verified)
      return error(res, "Phone number is already verified.", 400);

    const otp = generateOTP();
    const otp_expiry = getOTPExpiry();

    await pool.query(
      "UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE phone = ?",
      [otp, otp_expiry, phone],
    );

    console.log(`📱 Resent OTP for ${phone}: ${otp}`);

    return success(
      res,
      { phone, otp }, // OTP visible in response (development mode)
      "A new OTP has been sent to your phone.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to resend OTP.", 500);
  }
};

// ── Get Profile (Me) ──────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.phone, u.email, u.profile_image,
              u.date_of_birth, u.gender, u.is_verified, u.created_at, r.role_name
       FROM users u JOIN user_roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id],
    );
    if (rows.length === 0) return error(res, "User profile not found.", 404);
    return success(res, rows[0], "User profile retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve user profile.", 500);
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
    if (!isMatch) return error(res, "Current password is incorrect.", 400);

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      req.user.id,
    ]);

    return success(res, {}, "Password has been updated successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update password.", 500);
  }
};
