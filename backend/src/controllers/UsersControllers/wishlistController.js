import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get User Wishlist ────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT w.id, w.medicine_id,
             m.name, m.brand, m.pack_size,
             mi.image_url, c.slug AS category_slug,
             mb.id AS batch_id,
             mb.selling_price AS price, mb.mrp
      FROM wishlists w
      JOIN medicines m ON w.medicine_id = m.id
      LEFT JOIN medicine_images mi ON mi.medicine_id = m.id AND mi.is_primary = 1
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN medicine_batches mb ON mb.medicine_id = m.id
        AND mb.batch_status = 'active' AND mb.available_quantity > 0
        AND mb.id = (
          SELECT id FROM medicine_batches
          WHERE medicine_id = m.id AND batch_status = 'active' AND available_quantity > 0
          ORDER BY expiry_date ASC LIMIT 1
        )
      WHERE w.user_id = ?
      ORDER BY w.id DESC
    `,
      [req.user.id],
    );
    return success(res, rows, "Wishlist items retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve wishlist items.", 500);
  }
};

// ── Toggle Wishlist (Add/Remove) ─────────────────────
export const toggleWishlist = async (req, res) => {
  try {
    const { medicine_id } = req.body;
    if (!medicine_id) return error(res, "Medicine ID is required.", 400);

    const [existing] = await pool.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND medicine_id = ?",
      [req.user.id, medicine_id],
    );

    if (existing.length) {
      await pool.query("DELETE FROM wishlists WHERE id = ?", [existing[0].id]);
      return success(res, { wishlisted: false }, "Item removed from wishlist.");
    } else {
      await pool.query(
        "INSERT INTO wishlists (user_id, medicine_id) VALUES (?, ?)",
        [req.user.id, medicine_id],
      );
      return success(res, { wishlisted: true }, "Item added to your wishlist.");
    }
  } catch (err) {
    console.error(err);
    return error(res, "An error occurred while updating wishlist.", 500);
  }
};

// ── Remove from Wishlist ──────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM wishlists WHERE user_id = ? AND medicine_id = ?",
      [req.user.id, req.params.medicine_id],
    );
    return success(res, {}, "Item successfully removed from wishlist.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to remove item from wishlist.", 500);
  }
};
