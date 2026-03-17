import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

// ── Get all plans (public) ────────────────────────────
export const getPlans = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM subscription_plans ORDER BY id ASC`,
    );
    return success(res, rows, "Plans fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Plans fetch failed.", 500);
  }
};

// ── Get my subscriptions ──────────────────────────────
export const getMySubscriptions = async (req, res) => {
  try {
    const [subs] = await pool.query(
      `
      SELECT s.*,
             sp.name AS plan_name, sp.frequency, sp.discount_percent,
             ca.full_name AS addr_name, ca.city, ca.address_line1, ca.pincode
      FROM subscriptions s
      JOIN subscription_plans sp ON s.plan_id    = sp.id
      JOIN customer_addresses ca ON s.address_id = ca.id
      WHERE s.user_id = ?
      ORDER BY s.id DESC
    `,
      [req.user.id],
    );

    // For each subscription, get its items
    for (const sub of subs) {
      const [items] = await pool.query(
        `
        SELECT si.*, 
               m.name AS medicine_name, m.brand, m.pack_size,
               mi.image_url,
               mc.slug AS category_slug,
               mb.selling_price AS unit_price
        FROM subscription_items si
        JOIN medicines m ON si.medicine_id = m.id
        LEFT JOIN medicine_images mi ON mi.medicine_id = m.id AND mi.is_primary = 1
        LEFT JOIN categories mc ON m.category_id = mc.id
        LEFT JOIN medicine_batches mb ON mb.medicine_id = m.id
             AND mb.batch_status = 'active'
             AND mb.available_quantity > 0
        WHERE si.subscription_id = ?
        ORDER BY mb.expiry_date ASC
      `,
        [sub.id],
      );
      sub.items = items;
    }

    return success(res, subs, "Subscriptions fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

// ── Create subscription ───────────────────────────────
export const createSubscription = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { plan_id, address_id, payment_mode = "cod", items } = req.body;

    if (!plan_id || !address_id || !items?.length)
      return error(
        res,
        "Plan, address aur kam se kam ek medicine zaroori hai.",
        400,
      );

    // Get plan
    const [plans] = await conn.query(
      "SELECT * FROM subscription_plans WHERE id = ?",
      [plan_id],
    );
    if (!plans.length) return error(res, "Plan nahi mila.", 404);
    const plan = plans[0];

    const freqDays = { weekly: 7, biweekly: 14, monthly: 30, quarterly: 90 };
    const today = new Date();
    const next = new Date();
    next.setDate(next.getDate() + (freqDays[plan.frequency] || 30));

    // ── Create Subscription ───────────────────────
    const [result] = await conn.query(
      `INSERT INTO subscriptions (user_id, plan_id, address_id, start_date, next_delivery_date, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [
        req.user.id,
        plan_id,
        address_id,
        today.toISOString().slice(0, 10),
        next.toISOString().slice(0, 10),
      ],
    );
    const subId = result.insertId;

    // ── Insert Items ──────────────────────────────
    for (const item of items) {
      await conn.query(
        `INSERT INTO subscription_items (subscription_id, medicine_id, quantity) VALUES (?, ?, ?)`,
        [subId, item.medicine_id, item.quantity],
      );
    }

    // ── Create First Order ────────────────────────
    // Order number generate
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SUB-${dateStr}-${rand}`;

    // Calculate totals
    let subtotal = 0;
    const orderItemsData = [];
    for (const item of items) {
      const [batches] = await conn.query(
        `SELECT id, selling_price, mrp FROM medicine_batches
         WHERE medicine_id = ? AND batch_status = 'active' AND available_quantity >= ?
         ORDER BY expiry_date ASC LIMIT 1`,
        [item.medicine_id, item.quantity],
      );
      const batch = batches[0];
      const unitPrice = batch ? parseFloat(batch.selling_price) : 0;
      const discount = parseFloat(plan.discount_percent || 0);
      const discounted = unitPrice * (1 - discount / 100);
      const lineTotal = discounted * item.quantity;
      subtotal += lineTotal;
      orderItemsData.push({
        medicine_id: item.medicine_id,
        batch_id: batch?.id || null,
        quantity: item.quantity,
        unit_price: discounted.toFixed(2),
        total_price: lineTotal.toFixed(2),
      });
    }

    const delivery = subtotal >= 299 ? 0 : 49;
    const totalAmount = subtotal + delivery;

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (user_id, address_id, order_number, order_type, subtotal, delivery_charge,
         discount_amount, tax_amount, total_amount, payment_mode, payment_status, order_status)
       VALUES (?, ?, ?, 'subscription', ?, ?, ?, 0, ?, ?, 'pending', 'placed')`,
      [
        req.user.id,
        address_id,
        orderNumber,
        subtotal.toFixed(2),
        delivery,
        ((subtotal * parseFloat(plan.discount_percent || 0)) / 100).toFixed(2),
        totalAmount.toFixed(2),
        payment_mode,
      ],
    );
    const orderId = orderResult.insertId;

    // Insert order items + deduct stock
    for (const oi of orderItemsData) {
      await conn.query(
        `INSERT INTO order_items (order_id, medicine_id, batch_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          oi.medicine_id,
          oi.batch_id,
          oi.quantity,
          oi.unit_price,
          oi.total_price,
        ],
      );
      if (oi.batch_id) {
        await conn.query(
          `UPDATE medicine_batches SET available_quantity = available_quantity - ? WHERE id = ?`,
          [oi.quantity, oi.batch_id],
        );
      }
    }

    // Order status history
    await conn.query(
      `INSERT INTO order_status_history (order_id, status, updated_by) VALUES (?, 'placed', ?)`,
      [orderId, req.user.id],
    );

    // Link subscription → order
    await conn.query(
      `INSERT INTO subscription_orders (subscription_id, order_id, delivery_date) VALUES (?, ?, ?)`,
      [subId, orderId, today.toISOString().slice(0, 10)],
    );

    await conn.commit();
    return success(
      res,
      {
        id: subId,
        order_id: orderId,
        order_number: orderNumber,
        total_amount: totalAmount.toFixed(2),
        payment_mode,
      },
      "Subscription create ho gayi aur pehla order place ho gaya! 🎉",
      201,
    );
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return error(res, "Subscription create failed.", 500);
  } finally {
    conn.release();
  }
};

// ── Toggle pause/resume ───────────────────────────────
export const togglePause = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM subscriptions WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (!rows.length) return error(res, "Subscription nahi mili.", 404);
    if (rows[0].status === "cancelled")
      return error(res, "Cancelled subscription resume nahi ho sakti.", 400);

    const newStatus = rows[0].status === "active" ? "paused" : "active";
    await pool.query(`UPDATE subscriptions SET status = ? WHERE id = ?`, [
      newStatus,
      req.params.id,
    ]);

    return success(
      res,
      { status: newStatus },
      newStatus === "paused"
        ? "Subscription pause ho gayi."
        : "Subscription resume ho gayi.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Toggle failed.", 500);
  }
};

// ── Cancel subscription ───────────────────────────────
export const cancelSubscription = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM subscriptions WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (!rows.length) return error(res, "Subscription nahi mili.", 404);
    if (rows[0].status === "cancelled")
      return error(res, "Pehle se cancel hai.", 400);

    await pool.query(
      `UPDATE subscriptions SET status = 'cancelled' WHERE id = ?`,
      [req.params.id],
    );
    return success(res, {}, "Subscription cancel ho gayi.");
  } catch (err) {
    console.error(err);
    return error(res, "Cancel failed.", 500);
  }
};

// ── Get subscription orders history ──────────────────
export const getSubscriptionOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, status FROM subscriptions WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id],
    );
    if (!rows.length) return error(res, "Subscription nahi mili.", 404);

    const [orders] = await pool.query(
      `
      SELECT so.*, o.order_number, o.total_amount, o.order_status, o.created_at
      FROM subscription_orders so
      JOIN orders o ON so.order_id = o.id
      WHERE so.subscription_id = ?
      ORDER BY so.delivery_date DESC
    `,
      [req.params.id],
    );

    return success(res, orders, "Orders fetched.");
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};
