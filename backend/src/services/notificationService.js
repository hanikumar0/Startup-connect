import Notification from "../models/Notification.js";
import { getIO } from "../sockets/index.js";

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
            const userIdStr = userId.toString();
            // General notification event
            io.to(userIdStr).emit("notification", notification);
            // Targeted notification event (Legacy support)
            io.emit(`notification_${userIdStr}`, notification);
            
            // Connection-specific update trigger
            if (["connection_request", "connection_accepted", "match_request", "match_accepted"].includes(type)) {
                io.emit(`connection_update_${userIdStr}`, { type, notification });
            }
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
