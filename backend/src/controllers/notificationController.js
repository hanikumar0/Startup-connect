import Notification from "../models/Notification.js";

// @desc    Get user notifications
// @route   GET /api/notifications
export const getUserNotifications = async (req, res) => {
    try {
        const { type, isRead } = req.query;
        const userId = req.user.id;
        let query = { userId };
        
        if (type) query.type = type;
        if (isRead !== undefined) query.isRead = isRead === 'true';

        const notifications = await Notification.find(query).sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.status(200).json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/read/:id
export const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) return res.status(404).json({ message: "Notification context not found." });

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.status(200).json({ success: true, notification, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        
        res.status(200).json({ success: true, message: "All notifications calibrated as read." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId });
        
        if (!notification) return res.status(404).json({ message: "Notification context not found." });

        res.status(200).json({ success: true, message: "Notification deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
