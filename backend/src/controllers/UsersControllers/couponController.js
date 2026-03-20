import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get all coupons (public) ──────────────────────────
export const getActiveCoupons = async (req, res) => {
  try {
    // User logged in hai to uske used coupons filter karo
    const userId = req.user?.id || null;

    let rows;
    if (userId) {
      // User ke already used coupon IDs nikalo
      const [usedRows] = await pool.query(
        `SELECT coupon_id FROM coupon_usage WHERE user_id = ?`,
        [userId],
      );
      const usedIds = usedRows.map((r) => r.coupon_id);

      if (usedIds.length > 0) {
        // Used coupons ko filter karo
        const placeholders = usedIds.map(() => "?").join(",");
        [rows] = await pool.query(
          `SELECT id, code, discount_type, discount_value
            FROM coupons
            WHERE id NOT IN (${placeholders})
            ORDER BY id DESC`,
          usedIds,
        );
      } else {
        [rows] = await pool.query(
          `SELECT id, code, discount_type, discount_value FROM coupons ORDER BY id DESC`,
        );
      }
    } else {
      [rows] = await pool.query(
        `SELECT id, code, discount_type, discount_value FROM coupons ORDER BY id DESC`,
      );
    }

    return success(res, rows, "Active coupons retrieved successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve coupons.", 500);
  }
};

// ── Apply / Validate coupon ───────────────────────────
export const applyCoupon = async (req, res) => {
  try {
    const { code, order_amount } = req.body;
    const userId = req.user.id;

    if (!code || !order_amount)
      return error(res, "Coupon code and order amount are required.", 400);

    // Find coupon
    const [coupons] = await pool.query(`SELECT * FROM coupons WHERE code = ?`, [
      code.toUpperCase().trim(),
    ]);
    if (!coupons.length)
      return error(res, "Invalid or expired coupon code.", 404);

    const coupon = coupons[0];

    // Check already used by this user
    const [used] = await pool.query(
      `SELECT id FROM coupon_usage WHERE coupon_id = ? AND user_id = ?`,
      [coupon.id, userId],
    );
    if (used.length)
      return error(res, "You have already used this coupon code.", 400);

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "flat") {
      discount = parseFloat(coupon.discount_value);
    } else {
      // percent
      discount =
        (parseFloat(order_amount) * parseFloat(coupon.discount_value)) / 100;
    }
    discount = Math.min(discount, parseFloat(order_amount));
    discount = parseFloat(discount.toFixed(2));

    return success(
      res,
      {
        coupon_id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
        final_amount: parseFloat((order_amount - discount).toFixed(2)),
      },
      `Coupon applied successfully! You saved ₹${discount}.`,
    );
  } catch (err) {
    console.error(err);
    return error(res, "Internal server error while applying coupon.", 500);
  }
};
