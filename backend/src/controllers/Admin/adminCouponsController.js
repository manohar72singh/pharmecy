import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getCoupons = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM coupons",
    );
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(cu.id) AS used_count
       FROM coupons c
       LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
       GROUP BY c.id
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        coupons: rows,
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

export const createCoupon = async (req, res) => {
  try {
    const { code, discount_type, discount_value } = req.body;
    if (!code || !discount_type || !discount_value)
      return error(res, "Sab fields zaroori hain.", 400);
    const [result] = await pool.query(
      "INSERT INTO coupons (code, discount_type, discount_value) VALUES (?, ?, ?)",
      [code.toUpperCase(), discount_type, discount_value],
    );
    return success(res, { id: result.insertId }, "Coupon created.", 201);
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return error(res, "Yeh code already exists.", 400);
    console.error(err);
    return error(res, "Create failed.", 500);
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await pool.query("DELETE FROM coupons WHERE id = ?", [req.params.id]);
    return success(res, {}, "Coupon deleted.");
  } catch (err) {
    console.error(err);
    return error(res, "Delete failed.", 500);
  }
};
