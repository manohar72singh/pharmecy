import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get Cart ──────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const [items] = await pool.query(
      `
      SELECT
        ci.id,
        ci.medicine_id,
        ci.batch_id,
        ci.quantity,
        ci.prescription_id,
        m.name,
        m.brand,
        m.pack_size,
        mb.selling_price   AS price,
        mb.mrp,
        mi.image_url,
        c.slug             AS category_slug,
        (mb.selling_price * ci.quantity) AS subtotal
      FROM cart ci
      JOIN medicines        m   ON ci.medicine_id = m.id
      JOIN medicine_batches mb  ON ci.batch_id    = mb.id
      LEFT JOIN (
        SELECT medicine_id, image_url
        FROM medicine_images WHERE is_primary = 1
      ) mi ON mi.medicine_id = m.id
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.added_at DESC
    `,
      [userId],
    );

    const total = items.reduce(
      (sum, i) => sum + parseFloat(i.subtotal || 0),
      0,
    );

    return success(res, { items, total, count: items.length }, "Cart fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Cart fetch failed.", 500);
  }
};

// ── Add to Cart ───────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      medicine_id,
      batch_id,
      quantity = 1,
      prescription_id = null,
    } = req.body;

    if (!medicine_id || !batch_id)
      return error(res, "medicine_id aur batch_id zaroori hai.", 400);

    // Batch + stock check
    const [batch] = await pool.query(
      "SELECT id, available_quantity FROM medicine_batches WHERE id = ? AND medicine_id = ?",
      [batch_id, medicine_id],
    );
    if (batch.length === 0) return error(res, "Batch nahi mila.", 404);
    if (batch[0].available_quantity < quantity)
      return error(res, "Itna stock available nahi hai.", 400);

    // Already in cart?
    const [existing] = await pool.query(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND medicine_id = ? AND batch_id = ?",
      [userId, medicine_id, batch_id],
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + quantity;
      if (newQty > batch[0].available_quantity)
        return error(res, "Stock limit exceed ho gayi.", 400);
      await pool.query(
        "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?",
        [newQty, existing[0].id],
      );
    } else {
      await pool.query(
        "INSERT INTO cart (user_id, medicine_id, batch_id, quantity, prescription_id) VALUES (?, ?, ?, ?, ?)",
        [userId, medicine_id, batch_id, quantity, prescription_id],
      );
    }

    return success(res, {}, "Item cart mein add ho gaya.");
  } catch (err) {
    console.error(err);
    return error(res, "Cart add fail hua.", 500);
  }
};

// ── Update Quantity ───────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1)
      return error(res, "Quantity kam se kam 1 honi chahiye.", 400);

    const [item] = await pool.query(
      "SELECT ci.id, ci.batch_id FROM cart ci WHERE ci.id = ? AND ci.user_id = ?",
      [id, userId],
    );
    if (item.length === 0) return error(res, "Item nahi mila.", 404);

    // Stock check
    const [batch] = await pool.query(
      "SELECT available_quantity FROM medicine_batches WHERE id = ?",
      [item[0].batch_id],
    );
    if (batch[0].available_quantity < quantity)
      return error(res, "Itna stock available nahi hai.", 400);

    await pool.query(
      "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?",
      [quantity, id],
    );

    return success(res, {}, "Quantity update ho gayi.");
  } catch (err) {
    console.error(err);
    return error(res, "Update fail hua.", 500);
  }
};

// ── Remove Item ───────────────────────────────────────
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [item] = await pool.query(
      "SELECT id FROM cart WHERE id = ? AND user_id = ?",
      [id, userId],
    );
    if (item.length === 0) return error(res, "Item nahi mila.", 404);

    await pool.query("DELETE FROM cart WHERE id = ?", [id]);
    return success(res, {}, "Item remove ho gaya.");
  } catch (err) {
    console.error(err);
    return error(res, "Remove fail hua.", 500);
  }
};

// ── Clear Cart ────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    await pool.query("DELETE FROM cart WHERE user_id = ?", [req.user.id]);
    return success(res, {}, "Cart clear ho gayi.");
  } catch (err) {
    console.error(err);
    return error(res, "Cart clear fail hua.", 500);
  }
};

// ── Sync Cart (localStorage → DB on login) ────────────
export const syncCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body; // [{ medicine_id, batch_id, quantity }]

    if (!items || !Array.isArray(items))
      return error(res, "Items array zaroori hai.", 400);

    for (const item of items) {
      const { medicine_id, batch_id, quantity = 1 } = item;
      if (!medicine_id || !batch_id) continue;

      // Batch valid hai?
      const [batch] = await pool.query(
        "SELECT id, available_quantity FROM medicine_batches WHERE id = ? AND medicine_id = ?",
        [batch_id, medicine_id],
      );
      if (batch.length === 0) continue;

      const safeQty = Math.min(quantity, batch[0].available_quantity);
      if (safeQty <= 0) continue;

      const [existing] = await pool.query(
        "SELECT id, quantity FROM cart WHERE user_id = ? AND medicine_id = ? AND batch_id = ?",
        [userId, medicine_id, batch_id],
      );

      if (existing.length > 0) {
        const newQty = Math.min(
          existing[0].quantity + safeQty,
          batch[0].available_quantity,
        );
        await pool.query(
          "UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?",
          [newQty, existing[0].id],
        );
      } else {
        await pool.query(
          "INSERT INTO cart (user_id, medicine_id, batch_id, quantity) VALUES (?, ?, ?, ?)",
          [userId, medicine_id, batch_id, safeQty],
        );
      }
    }

    // Return updated cart
    const [cartItems] = await pool.query(
      `
      SELECT
        ci.id, ci.medicine_id, ci.batch_id, ci.quantity,
        m.name, m.brand, m.pack_size,
        mb.selling_price AS price, mb.mrp,
        mi.image_url, c.slug AS category_slug
      FROM cart ci
      JOIN medicines        m   ON ci.medicine_id = m.id
      JOIN medicine_batches mb  ON ci.batch_id    = mb.id
      LEFT JOIN (SELECT medicine_id, image_url FROM medicine_images WHERE is_primary=1) mi ON mi.medicine_id = m.id
      LEFT JOIN categories  c   ON m.category_id  = c.id
      WHERE ci.user_id = ?
      ORDER BY ci.added_at DESC
    `,
      [userId],
    );

    // localStorage clear karo
    return success(res, { items: cartItems }, "Cart synced successfully.");
  } catch (err) {
    console.error(err);
    return error(res, "Cart sync fail hua.", 500);
  }
};
