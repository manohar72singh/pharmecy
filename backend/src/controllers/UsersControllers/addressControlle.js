import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get All Addresses ─────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customer_addresses WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY is_default DESC, id DESC",
      [req.user.id],
    );
    return success(res, rows, "Addresses retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve addresses.", 500);
  }
};

// ── Add Address ───────────────────────────────────────
export const addAddress = async (req, res) => {
  try {
    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      is_default,
    } = req.body;

    if (!full_name || !address_line1 || !city || !pincode)
      return error(
        res,
        "Full name, address line 1, city, and pincode are required.",
        400,
      );

    // Agar default hai to pehle sab undefault karo
    if (is_default) {
      await pool.query(
        "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
        [req.user.id],
      );
    }

    // Pehla address auto default
    const [existing] = await pool.query(
      "SELECT COUNT(*) as cnt FROM customer_addresses WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)",
      [req.user.id],
    );
    const autoDefault = existing[0].cnt === 0 ? 1 : is_default ? 1 : 0;

    const [result] = await pool.query(
      `INSERT INTO customer_addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        full_name,
        phone || null,
        address_line1,
        address_line2 || null,
        city,
        state || null,
        pincode,
        autoDefault,
      ],
    );

    return success(
      res,
      { id: result.insertId },
      "Address added successfully.",
      201,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to add address.", 500);
  }
};

// ── Update Address ────────────────────────────────────
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      phone,
      address_line1,
      address_line2,
      city,
      state,
      pincode,
      is_default,
    } = req.body;

    const [addr] = await pool.query(
      "SELECT id FROM customer_addresses WHERE id = ? AND user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)",
      [id, req.user.id],
    );
    if (addr.length === 0) return error(res, "Address not found.", 404);

    if (is_default) {
      await pool.query(
        "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
        [req.user.id],
      );
    }

    await pool.query(
      `UPDATE customer_addresses SET full_name=?, phone=?, address_line1=?, address_line2=?, city=?, state=?, pincode=?, is_default=? WHERE id=?`,
      [
        full_name,
        phone || null,
        address_line1,
        address_line2 || null,
        city,
        state || null,
        pincode,
        is_default ? 1 : 0,
        id,
      ],
    );

    return success(res, {}, "Address updated successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update address.", 500);
  }
};

// ── Delete Address ────────────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const [addr] = await pool.query(
      "SELECT id, is_default FROM customer_addresses WHERE id = ? AND user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)",
      [id, req.user.id],
    );
    if (addr.length === 0) return error(res, "Address not found.", 404);

    await pool.query("UPDATE customer_addresses SET is_deleted = 1, is_default = 0 WHERE id = ?", [id]);

    // Agar default tha to pehle wale ko default karo
    if (addr[0].is_default) {
      await pool.query(
        "UPDATE customer_addresses SET is_default = 1 WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL) LIMIT 1",
        [req.user.id],
      );
    }

    return success(res, {}, "Address deleted successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to delete address.", 500);
  }
};

// ── Set Default ───────────────────────────────────────
export const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE customer_addresses SET is_default = 0 WHERE user_id = ?",
      [req.user.id],
    );
    await pool.query(
      "UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)",
      [id, req.user.id],
    );
    return success(res, {}, "Default address set successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Operation failed.", 500);
  }
};

// ── Validate Pincode ──────────────────────────────────
export const validatePincode = async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Public API Validation (Bypassing local Delivery Zones as requested)
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await response.json();

    if (data && data[0] && data[0].Status === "Success") {
      const info = data[0].PostOffice[0];
      // info.District often acts as City, info.State as State
      const city = info.District || info.Block || "Unknown City";
      const state = info.State || "Unknown State";
      
      return success(res, { valid: true, city: city, state: state }, "Pincode is valid.");
    } else {
      return error(res, "Please enter a valid active Pincode.", 400);
    }
  } catch (err) {
    console.error("Pincode Validation Error:", err);
    return error(res, "Failed to validate pincode.", 500);
  }
};
