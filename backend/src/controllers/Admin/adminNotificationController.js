import { createNotification, broadcastNotification } from "../../utils/notificationHelper.js";
import { success, error } from "../../utils/response.js";

export const sendBroadcast = async (req, res) => {
    try {
        const { title, message, type } = req.body;
        if (!title || !message) return error(res, "Title and message are required.", 400);

        await broadcastNotification(title, message, type || 'general');
        return success(res, null, "Broadcast sent to all customers successfully! 🎉");
    } catch (err) {
        console.error(err);
        return error(res, "Failed to send broadcast.", 500);
    }
};

export const sendDirectNotification = async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;
        if (!userId || !title || !message) return error(res, "User ID, title, and message are required.", 400);

        await createNotification(userId, title, message, type || 'general');
        return success(res, null, "Notification sent to the user successfully! ✅");
    } catch (err) {
        console.error(err);
        return error(res, "Failed to send notification.", 500);
    }
};
