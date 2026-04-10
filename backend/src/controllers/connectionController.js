import Connection from "../models/Connection.js";
import User from "../models/User.js";
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
            // Notify sender
            await createNotification({
                userId: connection.sender,
                type: "connection_accepted",
                title: "Connection Request Accepted",
                message: `${req.user.name} has accepted your connection request. You can now chat and schedule meetings.`,
                link: "/messages"
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

        res.status(200).json({ success: true, data: connections });
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
