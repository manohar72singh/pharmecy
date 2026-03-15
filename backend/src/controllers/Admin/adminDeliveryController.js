import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getDeliveryOrders = async (req, res) => {
  try {
    const { page = 1, limit = 15, status } = req.query;
    const offset = (page - 1) * limit;
    let where =
      "WHERE o.order_status IN ('confirmed','processing','packed','out_for_delivery')";
    const params = [];
    if (status) {
      where = "WHERE o.order_status = ?";
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM orders o ${where}`,
      params,
    );
    const [rows] = await pool.query(
      `SELECT o.id, o.order_number, o.order_status, o.total_amount, o.created_at,
              u.name AS user_name, u.phone AS user_phone,
              ca.address_line1, ca.city, ca.pincode,
              da.delivery_boy_id,
              db_user.name AS delivery_boy_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       JOIN customer_addresses ca ON o.address_id = ca.id
       LEFT JOIN delivery_assignments da ON o.id = da.order_id
       LEFT JOIN delivery_boys db ON da.delivery_boy_id = db.id
       LEFT JOIN users db_user ON db.user_id = db_user.id
       ${where}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );

    const [deliveryBoys] = await pool.query(
      `SELECT db.id, u.name, db.is_available
       FROM delivery_boys db JOIN users u ON db.user_id = u.id
       WHERE db.is_available = 1`,
    );

    return success(
      res,
      {
        orders: rows,
        delivery_boys: deliveryBoys,
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

export const assignDelivery = async (req, res) => {
  try {
    const { delivery_boy_id } = req.body;
    const { order_id } = req.params;

    const [existing] = await pool.query(
      "SELECT id FROM delivery_assignments WHERE order_id = ?",
      [order_id],
    );
    if (existing.length) {
      await pool.query(
        "UPDATE delivery_assignments SET delivery_boy_id = ? WHERE order_id = ?",
        [delivery_boy_id, order_id],
      );
    } else {
      await pool.query(
        "INSERT INTO delivery_assignments (order_id, delivery_boy_id) VALUES (?, ?)",
        [order_id, delivery_boy_id],
      );
    }
    await pool.query(
      "UPDATE orders SET order_status = 'out_for_delivery' WHERE id = ?",
      [order_id],
    );
    return success(res, {}, "Delivery assigned.");
  } catch (err) {
    console.error(err);
    return error(res, "Assign failed.", 500);
  }
};
