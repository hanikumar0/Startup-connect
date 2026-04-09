import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { uploadToS3 } from "../utils/s3.js";

// @desc    Start/Get a conversation between two users
// @route   POST /api/messages/conversation
export const getOrCreateConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        const currentUserId = req.user.id;

        if (participantId === currentUserId) {
            return res.status(400).json({ success: false, message: "Cannot start chat with yourself" });
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, participantId] }
        }).populate("participants", "name avatar role");

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [currentUserId, participantId]
            });
            conversation = await conversation.populate("participants", "name avatar role");
        }

        res.status(200).json({ success: true, data: conversation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
export const getMyConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id
        })
        .populate("participants", "name avatar role email")
        .sort("-updatedAt");

        res.status(200).json({ success: true, data: conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .populate("senderId", "name avatar")
            .sort("createdAt");

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload attachment
// @route   POST /api/messages/upload
export const uploadChatFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const result = await uploadToS3(req.file, "chat-attachments");
        res.status(200).json({ 
            success: true, 
            data: { 
                fileName: req.file.originalname, 
                fileUrl: result.url,
                fileType: req.file.mimetype 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:conversationId
export const markAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, senderId: { $ne: req.user.id } },
            { isRead: true }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
