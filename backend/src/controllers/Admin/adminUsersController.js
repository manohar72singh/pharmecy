import pool from "../../config/db.js";
import { success, error } from "../../utils/response.js";

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, role } = req.query;
    const offset = (page - 1) * limit;
    let where = "WHERE 1=1";
    const params = [];
    if (search) {
      where += " AND (u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (role) {
      where += " AND r.role_name = ?";
      params.push(role);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users u JOIN user_roles r ON u.role_id = r.id ${where}`,
      params,
    );
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.profile_image, u.is_verified, u.created_at,
              r.role_name AS role,
              COUNT(DISTINCT o.id) AS order_count
       FROM users u
       JOIN user_roles r ON u.role_id = r.id
       LEFT JOIN orders o ON u.id = o.user_id
       ${where}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)],
    );
    return success(
      res,
      {
        users,
        total: parseInt(total),
        page: parseInt(page),
        limit: parseInt(limit),
      },
      "Users fetched.",
    );
  } catch (err) {
    console.error(err);
    return error(res, "Fetch failed.", 500);
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role_id } = req.body;
    await pool.query("UPDATE users SET role_id = ? WHERE id = ?", [
      role_id,
      req.params.id,
    ]);
    return success(res, {}, "Role updated.");
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT is_verified FROM users WHERE id = ?",
      [req.params.id],
    );
    if (!users.length) return error(res, "User not found.", 404);
    const newStatus = users[0].is_verified ? 0 : 1;
    await pool.query("UPDATE users SET is_verified = ? WHERE id = ?", [
      newStatus,
      req.params.id,
    ]);
    return success(res, { is_verified: newStatus }, "Status updated.");
  } catch (err) {
    console.error(err);
    return error(res, "Update failed.", 500);
  }
};
