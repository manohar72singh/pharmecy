import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50`,
      [req.user.id],
    );
    const unread = rows.filter((n) => !n.is_read).length;
    return success(
      res,
      { notifications: rows, unread },
      "Notifications retrieved successfully.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to retrieve notifications.", 500);
  }
};

export const markRead = async (req, res) => {
  try {
    await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [
      req.user.id,
    ]);
    return success(res, {}, "All notifications marked as read.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update notifications.", 500);
  }
};

export const markOneRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    return success(res, {}, "Notification marked as read.");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update notification status.", 500);
  }
};
