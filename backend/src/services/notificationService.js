import Notification from "../models/Notification.js";
import { getIO } from "../socket.js";

/**
 * @desc    Create a new notification & emit real-time event
 * @param   {Object} data - { userId, type, title, message, link }
 */
export const createNotification = async ({ userId, type, title, message, link }) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            link
        });

        // 1. Emit real-time via Socket.io
        const io = getIO();
        if (io) {
            io.to(userId.toString()).emit("notification", notification);
        }

        // 2. Increment unread count in real-time
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });
        if (io) {
            io.to(userId.toString()).emit("unread_count", { count: unreadCount });
        }

        // 3. Optional: Send Email (if user has enabled it)
        // sendEmailNotification(...)

        return notification;
    } catch (error) {
        console.error("Notification trigger failed:", error);
    }
};
