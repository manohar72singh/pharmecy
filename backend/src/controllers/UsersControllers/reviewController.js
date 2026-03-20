import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get Medicine Reviews ─────────────────────────────
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
    return success(res, rows, "Reviews retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve reviews.", 500);
  }
};

// ── Add New Review ───────────────────────────────────
export const addReview = async (req, res) => {
  try {
    const { medicine_id, order_id, rating, comment } = req.body;
    if (!medicine_id || !rating)
      return error(res, "Medicine ID and rating are required.", 400);

    if (rating < 1 || rating > 5)
      return error(res, "Rating must be between 1 and 5.", 400);

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
        "You have already submitted a review for this purchase.",
        400,
      );

    // Verify order ownership
    if (order_id) {
      const [orders] = await pool.query(
        `SELECT id FROM orders WHERE id = ? AND user_id = ?`,
        [order_id, req.user.id],
      );
      if (!orders.length) return error(res, "Order verification failed.", 400);
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
    return success(
      res,
      { id: result.insertId },
      "Review submitted successfully! ⭐",
      201,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to submit review.", 500);
  }
};

// ── Delete Review ────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    await pool.query("DELETE FROM reviews WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);
    return success(res, {}, "Review deleted successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to delete review.", 500);
  }
};
