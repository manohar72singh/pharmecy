import pool from "../config/db.js";
import { success, error } from "../utils/response.js";

// ── Order Number Generate ─────────────────────────────
const generateOrderNumber = () => {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${ymd}-${rand}`;
};

// ── Place Order ───────────────────────────────────────
export const placeOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const userId = req.user.id;
    const {
      address_id,
      payment_mode,
      coupon_id = null,
      discount_amount: clientDiscount = 0, // ✅ Frontend se aaya discount
      notes = null,
    } = req.body;

    if (!address_id || !payment_mode)
      return error(res, "Address aur payment mode zaroori hai.", 400);

    const validModes = ["cod", "online", "upi", "wallet"];
    if (!validModes.includes(payment_mode))
      return error(res, "Invalid payment mode.", 400);

    // Address verify
    const [addr] = await conn.query(
      "SELECT id FROM customer_addresses WHERE id = ? AND user_id = ?",
      [address_id, userId],
    );
    if (addr.length === 0) return error(res, "Address nahi mila.", 404);

    // Cart items fetch
    const [cartItems] = await conn.query(
      `SELECT ci.id, ci.medicine_id, ci.batch_id, ci.quantity,
              mb.selling_price, mb.mrp, mb.available_quantity, m.name
       FROM cart ci
       JOIN medicine_batches mb ON ci.batch_id    = mb.id
       JOIN medicines        m  ON ci.medicine_id = m.id
       WHERE ci.user_id = ?`,
      [userId],
    );

    if (cartItems.length === 0) return error(res, "Cart khali hai.", 400);

    // Stock check + subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      if (item.available_quantity < item.quantity)
        return error(res, `"${item.name}" ka stock available nahi hai.`, 400);
      subtotal += parseFloat(item.selling_price) * item.quantity;
    }

    // ── Coupon Discount ───────────────────────────────
    // Frontend se aaya discount use karo (already validated)
    // Agar nahi aaya to backend se calculate karo
    let discountAmount = parseFloat(clientDiscount) || 0;

    if (coupon_id && discountAmount === 0) {
      const [coupon] = await conn.query(
        "SELECT id, discount_type, discount_value FROM coupons WHERE id = ?",
        [coupon_id],
      );
      if (coupon.length > 0) {
        const dtype = (coupon[0].discount_type || "").toLowerCase();
        const dvalue = parseFloat(coupon[0].discount_value) || 0;

        if (dtype === "flat") {
          discountAmount = dvalue;
        } else {
          // 'percent' ya koi bhi aur value
          discountAmount = parseFloat(((subtotal * dvalue) / 100).toFixed(2));
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    // Delivery + Tax + Total
    const deliveryCharge = subtotal >= 299 ? 0 : 49;
    const taxAmount = 0;
    const totalAmount = subtotal - discountAmount + deliveryCharge + taxAmount;

    // Order insert
    const orderNumber = generateOrderNumber();
    const [orderResult] = await conn.query(
      `INSERT INTO orders
       (user_id, address_id, coupon_id, order_number, order_type, subtotal, delivery_charge,
        discount_amount, tax_amount, total_amount, payment_mode, payment_status, order_status, notes)
       VALUES (?, ?, ?, ?, 'normal', ?, ?, ?, ?, ?, ?, 'pending', 'placed', ?)`,
      [
        userId,
        address_id,
        coupon_id,
        orderNumber,
        subtotal,
        deliveryCharge,
        discountAmount,
        taxAmount,
        totalAmount,
        payment_mode,
        notes,
      ],
    );
    const orderId = orderResult.insertId;

    // Coupon usage track
    if (coupon_id) {
      await conn.query(
        "INSERT INTO coupon_usage (coupon_id, user_id, order_id) VALUES (?, ?, ?)",
        [coupon_id, userId, orderId],
      );
    }

    // Order items + stock deduct
    for (const item of cartItems) {
      const itemTotal = parseFloat(item.selling_price) * item.quantity;
      await conn.query(
        `INSERT INTO order_items (order_id, medicine_id, batch_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.medicine_id,
          item.batch_id,
          item.quantity,
          item.selling_price,
          itemTotal,
        ],
      );
      await conn.query(
        "UPDATE medicine_batches SET available_quantity = available_quantity - ? WHERE id = ?",
        [item.quantity, item.batch_id],
      );
    }

    // Status history
    await conn.query(
      "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
      [orderId, "placed", userId],
    );

    // Cart clear
    await conn.query("DELETE FROM cart WHERE user_id = ?", [userId]);

    await conn.commit();
    return success(
      res,
      {
        order_id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount,
        payment_mode,
        order_status: "placed",
      },
      "Order place ho gaya! 🎉",
      201,
    );
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return error(res, "Order place karna fail hua.", 500);
  } finally {
    conn.release();
  }
};

// ── Get My Orders ─────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.order_number, o.order_status, o.order_type,
              o.payment_mode, o.payment_status,
              o.subtotal, o.delivery_charge, o.discount_amount, o.total_amount,
              o.created_at, o.estimated_delivery,
              COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id],
    );
    return success(res, orders, "Orders fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Orders fetch failed.", 500);
  }
};

// ── Get Order Detail ──────────────────────────────────
export const getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await pool.query(
      `SELECT o.*,
              ca.full_name, ca.phone AS addr_phone,
              ca.address_line1, ca.address_line2,
              ca.city, ca.state, ca.pincode
       FROM orders o
       JOIN customer_addresses ca ON o.address_id = ca.id
       WHERE o.id = ? AND o.user_id = ?`,
      [id, req.user.id],
    );
    if (orders.length === 0) return error(res, "Order nahi mila.", 404);

    const [items] = await pool.query(
      `SELECT oi.id, oi.medicine_id, oi.quantity, oi.unit_price, oi.total_price,
              m.name, m.brand, m.pack_size,
              mi.image_url, c.slug AS category_slug
       FROM order_items oi
       JOIN medicines m ON oi.medicine_id = m.id
       LEFT JOIN (
         SELECT medicine_id, image_url FROM medicine_images WHERE is_primary = 1
       ) mi ON mi.medicine_id = m.id
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE oi.order_id = ?`,
      [id],
    );

    const [history] = await pool.query(
      "SELECT status, created_at FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC",
      [id],
    );

    return success(
      res,
      { order: orders[0], items, history },
      "Order detail fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Order detail fetch failed.", 500);
  }
};

// ── Cancel Order ──────────────────────────────────────
export const cancelOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id } = req.params;
    const { reason = "Customer ne cancel kiya" } = req.body;

    const [orders] = await conn.query(
      "SELECT id, order_status FROM orders WHERE id = ? AND user_id = ?",
      [id, req.user.id],
    );
    if (orders.length === 0) return error(res, "Order nahi mila.", 404);

    const cancelable = ["placed", "confirmed", "processing"];
    if (!cancelable.includes(orders[0].order_status))
      return error(
        res,
        `"${orders[0].order_status}" status mein cancel nahi ho sakta.`,
        400,
      );

    // Stock wapas
    const [items] = await conn.query(
      "SELECT batch_id, quantity FROM order_items WHERE order_id = ?",
      [id],
    );
    for (const item of items) {
      await conn.query(
        "UPDATE medicine_batches SET available_quantity = available_quantity + ? WHERE id = ?",
        [item.quantity, item.batch_id],
      );
    }

    await conn.query(
      "UPDATE orders SET order_status = ?, cancellation_reason = ? WHERE id = ?",
      ["cancelled", reason, id],
    );
    await conn.query(
      "INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, ?, ?)",
      [id, "cancelled", req.user.id],
    );

    await conn.commit();
    return success(res, {}, "Order cancel ho gaya.");
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return error(res, "Cancel failed.", 500);
  } finally {
    conn.release();
  }
};
