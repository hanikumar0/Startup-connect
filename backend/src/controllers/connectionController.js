import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { createNotification } from "../services/notificationService.js";

// @desc    Send a connection request
// @route   POST /api/connections/request
export const sendRequest = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const senderId = req.user.id;

        if (senderId === recipientId) {
            return res.status(400).json({ success: false, message: "You cannot connect with yourself" });
        }

        // Check if existing connection or request
        const existing = await Connection.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Connection request already exists or you are already connected" });
        }

        const connection = await Connection.create({
            sender: senderId,
            recipient: recipientId,
            message,
            status: "PENDING"
        });

        // Notify recipient
        await createNotification({
            userId: recipientId,
            type: "connection_request",
            title: "New Connection Request",
            message: `${req.user.name} wants to connect with you.`,
            link: "/dashboard"
        });

        res.status(201).json({ success: true, data: connection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Respond to a connection request
// @route   PUT /api/connections/respond/:id
export const respondToRequest = async (req, res) => {
    try {
        const { status } = req.body; // ACCEPTED or REJECTED
        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const connection = await Connection.findById(req.params.id);
        if (!connection) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        if (connection.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        connection.status = status;
        await connection.save();

        if (status === "ACCEPTED") {
            // Auto-create conversation
            const existingConversation = await Conversation.findOne({
                participants: { $all: [connection.sender, connection.recipient] }
            });

            if (!existingConversation) {
                const newConv = await Conversation.create({
                    participants: [connection.sender, connection.recipient],
                    isActive: true
                });
                connection.conversationId = newConv._id;
                console.log(`[DB] New Conversation created: ${newConv._id}`);
            } else {
                connection.conversationId = existingConversation._id;
            }

            await connection.save();
            console.log(`[DB] Connection ${connection._id} status updated to ACCEPTED`);

            // Notify sender
            await createNotification({
                userId: connection.sender,
                type: "connection_accepted",
                title: "Connection Request Accepted",
                message: `${req.user.name} has accepted your connection request. You can now chat and schedule meetings.`,
                link: "/dashboard/chat"
            });
        }

        res.status(200).json({ success: true, data: connection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my connections
// @route   GET /api/connections
export const getMyConnections = async (req, res) => {
    try {
        const connections = await Connection.find({
            $or: [{ sender: req.user.id }, { recipient: req.user.id }],
            status: "ACCEPTED"
        }).populate("sender recipient", "name avatar role lastLogin");

        // Enforce ObjectId-based conversations for every connection
        const enrichedConnections = await Promise.all(connections.map(async (conn) => {
            const partner = conn.sender._id.toString() === req.user.id.toString() ? conn.recipient : conn.sender;
            
            let conversation = await Conversation.findOne({
                participants: { $all: [conn.sender._id, conn.recipient._id] }
            });

            // Auto-provision if missing (Self-healing infrastructure)
            if (!conversation) {
                conversation = await Conversation.create({
                    participants: [conn.sender._id, conn.recipient._id]
                });
            }

            const unreadCount = await Message.countDocuments({
                conversationId: conversation._id,
                senderId: { $ne: req.user.id },
                isRead: false
            });

            return {
                id: partner._id,
                name: partner.name,
                role: partner.role,
                avatar: partner.avatar,
                connectionId: conn._id,
                conversationId: conversation._id,
                unreadCount,
                status: conn.status
            };
        }));

        console.log(`[DB] Fetched ${enrichedConnections.length} accepted connections with unread counts`);
        res.status(200).json({ success: true, connections: enrichedConnections });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get pending requests
// @route   GET /api/connections/pending
export const getPendingRequests = async (req, res) => {
    try {
        const requests = await Connection.find({
            recipient: req.user.id,
            status: "PENDING"
        }).populate("sender", "name avatar role");

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get sent requests
// @route   GET /api/connections/sent
export const getSentRequests = async (req, res) => {
    try {
        const requests = await Connection.find({
            sender: req.user.id,
            status: "PENDING"
        }).populate("recipient", "name avatar role");

        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel a connection request
// @route   DELETE /api/connections/cancel/:id
export const cancelRequest = async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        // Only the sender can cancel a pending request
        if (connection.sender.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        if (connection.status !== "PENDING") {
            return res.status(400).json({ success: false, message: "Only pending requests can be cancelled" });
        }

        await connection.deleteOne();

        res.status(200).json({ success: true, message: "Request cancelled" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove a connection
// @route   DELETE /api/connections/:id
export const removeConnection = async (req, res) => {
    try {
        const connection = await Connection.findById(req.params.id);
        if (!connection) {
            return res.status(404).json({ success: false, message: "Connection not found" });
        }

        if (connection.sender.toString() !== req.user.id && connection.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await connection.deleteOne();

        res.status(200).json({ success: true, message: "Connection removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
