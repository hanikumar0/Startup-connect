import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";

// @desc    Start/Get a conversation between two users
// @route   POST /api/messages/conversation
export const getOrCreateConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        const currentUserId = req.user.id;

        if (participantId === currentUserId) {
            return res.status(400).json({ success: false, message: "Cannot start chat with yourself" });
        }

        // Connection Check Log
        const connection = await Connection.findOne({
            $or: [
                { sender: currentUserId, recipient: participantId },
                { sender: participantId, recipient: currentUserId }
            ]
        });

        console.log(`[Connection Check] Users: ${currentUserId} ↔ ${participantId} | Status: ${connection?.status || 'not found'}`);

        if (connection?.status !== "ACCEPTED") {
            console.log(`[Blocked] Users are not connected`);
            return res.status(403).json({ success: false, message: "You must be connected to start a conversation" });
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
        console.error("[Conversation Error]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages/send
export const sendMessage = async (req, res) => {
    console.log("📩 MESSAGE API HIT");
    try {
        const { conversationId, text, attachments, messageType, fileUrl, fileName, fileSize, meetingInfo } = req.body;
        const senderId = req.user.id;

        if (!conversationId) {
            console.error("[Blocked] conversationId is missing");
            return res.status(400).json({ success: false, message: "conversationId is missing" });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            console.error(`[Blocked] Conversation ${conversationId} not found`);
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        const recipientId = conversation.participants.find(p => p.toString() !== senderId.toString());

        // Connection Check
        const connection = await Connection.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });

        console.log(`[Connection Check] Users: ${senderId} ↔ ${recipientId} | Status: ${connection?.status || 'not found'}`);

        if (connection?.status !== "ACCEPTED") {
            const errorMsg = "Users are not connected";
            console.log(`[Blocked] ${errorMsg}`);
            return res.status(403).json({ success: false, message: errorMsg });
        }

        const message = await Message.create({
            conversationId,
            senderId,
            text,
            attachments,
            messageType,
            fileUrl,
            fileName,
            fileSize,
            meetingInfo
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text: text || "Sent an attachment",
                senderId,
                at: new Date()
            }
        });

        const msgCount = await Message.countDocuments({ conversationId });
        console.log(`[DB] Message stored successfully`);
        console.log(`[DB] Total messages in conversation: ${msgCount}`);

        console.log(`[Message] ✅ Sent Successfully | Sender: ${senderId} | Receiver: ${recipientId} | ConversationId: ${conversationId} | Message: ${text?.substring(0, 20)}... | Time: ${new Date().toISOString()}`);

        res.status(201).json({ success: true, message: "Message sent successfully", data: message });
    } catch (error) {
        console.error("[Message Error]", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Message failed", 
            error: error.message 
        });
    }
};

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
export const getMyConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.id,
            isActive: true
        })
        .populate("participants", "name avatar role email")
        .sort("-updatedAt");

        const data = await Promise.all(conversations.map(async (conv) => {
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                senderId: { $ne: req.user.id },
                isRead: false
            });
            return {
                ...conv.toObject(),
                unreadCount
            };
        }));

        console.log(`[DB] Fetched ${data.length} conversations for user ${req.user.id}`);
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("[Fetch Error]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ 
            conversationId,
            isDeletedForBoth: { $ne: true },
            deletedFor: { $ne: req.user.id }
        })
            .populate("senderId", "name avatar")
            .sort("createdAt");

        console.log(`[DB] Fetched ${messages.length} visible messages for conversation ${conversationId}`);
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("[Fetch Error]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload attachment
// @route   POST /api/messages/upload
export const uploadChatFile = async (req, res) => {
    console.log("📤 [UPLOAD] Request received at /api/messages/upload");
    try {
        if (!req.file) {
            console.warn("❌ [UPLOAD] No file received from client");
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        
        console.log("☁️ [UPLOAD] File successfully handled by Cloudinary Storage");
        console.log(`☁️ [UPLOAD] File: ${req.file.originalname} | Size: ${req.file.size} | Type: ${req.file.mimetype}`);

        // With multer-storage-cloudinary, the URL is in req.file.path
        res.status(200).json({ 
            success: true, 
            data: { 
                fileName: req.file.originalname, 
                fileUrl: req.file.path,
                fileType: req.file.mimetype,
                fileSize: req.file.size,
                resourceType: req.file.resource_type || "auto",
                publicId: req.file.filename,
                // Alignment with strict rules
                url: req.file.path,
                public_id: req.file.filename,
                bytes: req.file.size,
                format: req.file.mimetype?.split("/")[1] || "auto"
            } 
        });
        console.log("✅ [UPLOAD] Success response sent to client");
    } catch (error) {
        console.error("❌ [UPLOAD] Critical Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Track pitch view
// @route   POST /api/messages/view-pitch/:messageId
export const trackPitchView = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id; // The person viewing (likely investor)

        const message = await Message.findById(messageId);
        if (!message || message.messageType !== "pitch") {
            return res.status(404).json({ success: false, message: "Pitch message not found" });
        }

        const senderId = message.senderId; // The founder who sent it

        // 1. Record Event
        const startup = await Startup.findOne({ userId: senderId });
        if (startup) {
            await Event.create({
                userId,
                type: "pitch_download", // Use existing enum value
                targetId: startup._id,
                targetType: "startup",
                metadata: { messageId }
            });

            // 2. Increment Analytics
            await AnalyticsStartup.findOneAndUpdate(
                { startupId: startup._id },
                { $inc: { pitchDownloads: 1 } },
                { upsert: true }
            );

            // 3. Notify Founder
            await createNotification({
                userId: senderId,
                sender: userId,
                type: "pitch_downloaded",
                title: "Pitch Deck Viewed",
                message: `${req.user.name} has viewed your pitch deck for ${startup.startupName}.`,
                link: "/dashboard/analytics/startup"
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("[Pitch Trace Error]", error.message);
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
        console.error("[Read Marker Error]", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
export const editMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Only sender can edit
        if (message.senderId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to edit this message" });
        }

        message.text = text;
        message.isEdited = true;
        await message.save();

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a message for everyone (global withdrawal)
// @route   DELETE /api/messages/:id
export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Only sender can delete for everyone
        if (message.senderId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized to delete for everyone" });
        }

        message.isDeletedForBoth = true;
        // Optionally clear text/attachments here if you want literal "clean" delete in DB too
        message.text = undefined;
        message.attachments = [];
        await message.save();

        res.status(200).json({ success: true, message: "Message deleted for everyone" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a message for only the current user
// @route   PUT /api/messages/delete-for-me/:id
export const deleteForMe = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Use $addToSet to avoid duplicates
        await Message.findByIdAndUpdate(req.params.id, {
            $addToSet: { deletedFor: req.user.id }
        });

        res.status(200).json({ success: true, message: "Message hidden for you" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
