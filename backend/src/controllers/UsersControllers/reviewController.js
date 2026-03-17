import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getMedicineReviews = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT r.id, r.medicine_id, r.user_id, r.order_id, r.rating,
             r.title, r.comment, r.is_verified_purchase, r.created_at,
             u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.medicine_id = ?
      ORDER BY r.id DESC
    `,
      [req.params.medicine_id],
    );
    return success(res, rows, "Reviews fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

export const addReview = async (req, res) => {
  try {
    const { medicine_id, order_id, rating, comment } = req.body;
    if (!medicine_id || !rating)
      return error(res, "Medicine aur rating zaroori hai.", 400);
    if (rating < 1 || rating > 5)
      return error(res, "Rating 1-5 ke beech honi chahiye.", 400);

    // Check already reviewed — same order + same medicine
    const checkQuery = order_id
      ? "SELECT id FROM reviews WHERE user_id = ? AND medicine_id = ? AND order_id = ?"
      : "SELECT id FROM reviews WHERE user_id = ? AND medicine_id = ? AND order_id IS NULL";
    const checkParams = order_id
      ? [req.user.id, medicine_id, order_id]
      : [req.user.id, medicine_id];

    const [existing] = await pool.query(checkQuery, checkParams);
    if (existing.length)
      return error(
        res,
        "Aapne is order ke liye pehle se review de diya hai.",
        400,
      );

    // order_id se verify karo — order user ka hi ho
    if (order_id) {
      const [orders] = await pool.query(
        `SELECT id FROM orders WHERE id = ? AND user_id = ?`,
        [order_id, req.user.id],
      );
      if (!orders.length) return error(res, "Order verify nahi hua.", 400);
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (medicine_id, user_id, order_id, rating, comment, is_verified_purchase)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        medicine_id,
        req.user.id,
        order_id || null,
        rating,
        comment || null,
        order_id ? 1 : 0,
      ],
    );
    return success(res, { id: result.insertId }, "Review add ho gaya! ⭐", 201);
  } catch (err) {
    console.error(err);
    return error(res, "Review add failed.", 500);
  }
};

export const deleteReview = async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);
    return success(res, {}, "Review delete ho gaya.");
  } catch (err) {
    console.error(err);
    return error(res, "Delete failed.", 500);
  }
};
