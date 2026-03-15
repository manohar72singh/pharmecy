import pool from "../config/db.js";
import { success, error } from "../utils/response.js";

// ── Get All Addresses ─────────────────────────────────
export const getAddresses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
      [req.user.id],
    );
    return success(res, rows, "Addresses fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Addresses fetch failed.", 500);
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
        "Full name, address, city aur pincode zaroori hai.",
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
      "SELECT COUNT(*) as cnt FROM customer_addresses WHERE user_id = ?",
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

    return success(res, { id: result.insertId }, "Address add ho gaya.", 201);
  } catch (err) {
    console.error(err);
    return error(res, "Address add failed.", 500);
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
      "SELECT id FROM customer_addresses WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    if (addr.length === 0) return error(res, "Address nahi mila.", 404);

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

    return success(res, {}, "Address update ho gaya.");
  } catch (err) {
    console.error(err);
    return error(res, "Address update failed.", 500);
  }
};

// ── Delete Address ────────────────────────────────────
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const [addr] = await pool.query(
      "SELECT id, is_default FROM customer_addresses WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    if (addr.length === 0) return error(res, "Address nahi mila.", 404);

    await pool.query("DELETE FROM customer_addresses WHERE id = ?", [id]);

    // Agar default tha to pehle wale ko default karo
    if (addr[0].is_default) {
      await pool.query(
        "UPDATE customer_addresses SET is_default = 1 WHERE user_id = ? LIMIT 1",
        [req.user.id],
      );
    }

    return success(res, {}, "Address delete ho gaya.");
  } catch (err) {
    console.error(err);
    return error(res, "Address delete failed.", 500);
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
      "UPDATE customer_addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    return success(res, {}, "Default address set ho gaya.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed.", 500);
  }
};
