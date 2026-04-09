import pool from "../config/db.js";

/**
 * Creates a notification for a user
 * @param {number} userId - The ID of the recipient
 * @param {string} title - The notification title
 * @param {string} message - The notification body
 * @param {string} type - The notification type (matches enum in DB)
 * @param {object} data - Optional JSON data (e.g. order_id)
 */
export const createNotification = async (userId, title, message, type = 'general', data = null) => {
    try {
        await pool.query(
            "INSERT INTO notifications (user_id, title, message, type, data) VALUES (?, ?, ?, ?, ?)",
            [userId, title, message, type, data ? JSON.stringify(data) : null]
        );
        return true;
    } catch (err) {
        console.error("Failed to create notification:", err.message);
        return false;
    }
};

/**
 * Broadcasts a notification to all customers
 */
export const broadcastNotification = async (title, message, type = 'general') => {
    try {
        // Fetch all users with 'customer' role
        const [users] = await pool.query(
            "SELECT id FROM users WHERE role_id = (SELECT id FROM user_roles WHERE role_name = 'customer')"
        );

        const queries = users.map(user => 
            pool.query(
                "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [user.id, title, message, type]
            )
        );

        await Promise.all(queries);
        return true;
    } catch (err) {
        console.error("Failed to broadcast notification:", err.message);
        return false;
    }
};

/**
 * Notifies all users with administrative roles
 */
export const notifyAdmins = async (title, message, type = 'general', data = null) => {
    try {
        const [admins] = await pool.query(
            "SELECT id FROM users WHERE role_id IN (SELECT id FROM user_roles WHERE role_name IN ('admin', 'super_admin', 'pharmacist'))"
        );

        const queries = admins.map(admin => 
            pool.query(
                "INSERT INTO notifications (user_id, title, message, type, data) VALUES (?, ?, ?, ?, ?)",
                [admin.id, title, message, type, data ? JSON.stringify(data) : null]
            )
        );

        await Promise.all(queries);
        return true;
    } catch (err) {
        console.error("Failed to notify admins:", err.message);
        return false;
    }
};
