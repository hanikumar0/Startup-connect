import Notification from "../models/Notification.js";
import VDRDocument from "../models/VDRDocument.js";
import User from "../models/User.js";
import VDRRoom from "../models/VDRRoom.js";
import VDRMessage from "../models/VDRMessage.js";
import VDRFile from "../models/VDRFile.js";
import VDRDataField from "../models/VDRDataField.js";
import Connection from "../models/Connection.js";
import { ensureVDRRoom } from "../services/vdrService.js";
import { encryptMessage, decryptMessage } from "../utils/vdrEncryption.js";
import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export const uploadVDRDocument = async (req, res) => {
    try {
        const { name, category, url, isRestricted, size, fileType } = req.body;
        const userId = req.user.id;

        if (!name || !category || !url) {
            return res.status(400).json({ message: "Name, category, and URL are required" });
        }

        let aiAnalysis = { summary: "Analyzing...", riskScore: 0, clauses: [] };
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze-document`, {
                doc_name: name,
                doc_content: `Analyzing ${name} in category ${category}. Highly confidential.`
            }, { timeout: 10000 });

            if (aiResponse.data.success) {
                aiAnalysis = aiResponse.data.analysis;
            }
        } catch (error) {
            console.warn("⚠️ AI Analysis unavailable (using defaults):", error.message);
        }

        const doc = await VDRDocument.create({
            owner: userId,
            name,
            category,
            url,
            isRestricted,
            size,
            fileType,
            authorizedUsers: [userId],
            aiSummary: aiAnalysis.summary,
            riskScore: aiAnalysis.risk_score || aiAnalysis.riskScore || 0,
            keyClauses: aiAnalysis.clauses || []
        });

        res.status(201).json({ success: true, document: doc });
    } catch (error) {
        console.error("VDR Upload Error:", error.message);
        res.status(500).json({ message: "Failed to upload document" });
    }
};

export const getStartupVDR = async (req, res) => {
    try {
        const { startupId } = req.params;
        const visitorId = req.user.id;
        const targetId = startupId === "me" ? visitorId : startupId;

        const documents = await VDRDocument.find({ owner: targetId });

        const processedDocs = documents.map(doc => {
            const hasAccess = !doc.isRestricted || doc.authorizedUsers.includes(visitorId);
            const request = doc.accessRequests.find(r => r.user.toString() === visitorId.toString());

            return {
                _id: doc._id,
                name: doc.name,
                category: doc.category,
                isRestricted: doc.isRestricted,
                size: doc.size,
                fileType: doc.fileType,
                hasAccess,
                requestStatus: request ? request.status : null,
                url: hasAccess ? doc.url : null
            };
        });

        res.status(200).json({ success: true, documents: processedDocs });
    } catch (error) {
        console.error("Get VDR Error:", error.message);
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};

export const requestVDRAccess = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const doc = await VDRDocument.findById(documentId);
        if (!doc) return res.status(404).json({ message: "Document not found" });

        const existingRequest = doc.accessRequests.find(r => r.user.toString() === userId.toString());
        if (existingRequest) return res.status(400).json({ message: "Request already exists" });

        doc.accessRequests.push({ user: userId, status: "PENDING" });
        await doc.save();

        const requester = await User.findById(userId);
        await Notification.create({
            userId: doc.owner,
            sender: userId,
            type: "system_alert",
            title: "VDR Access Request",
            message: `${requester.name} requested access to ${doc.name}`,
            link: "/dashboard/settings"
        });

        res.status(200).json({ success: true, message: "Request sent" });
    } catch (error) {
        console.error("VDR Access Request Error:", error.message);
        res.status(500).json({ message: "Failed to send access request" });
    }
};

export const handleAccessRequest = async (req, res) => {
    try {
        const { documentId, requestId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json({ message: "Status must be APPROVED or REJECTED" });
        }

        const doc = await VDRDocument.findOne({ _id: documentId, owner: userId });
        if (!doc) return res.status(404).json({ message: "Document not found or unauthorized" });

        const request = doc.accessRequests.id(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        if (status === "APPROVED") {
            if (!doc.authorizedUsers.includes(request.user)) {
                doc.authorizedUsers.push(request.user);
            }
        }

        await doc.save();

        await Notification.create({
            userId: request.user,
            sender: userId,
            type: "system_alert",
            title: `VDR Access ${status}`,
            message: `Your request for ${doc.name} was ${status.toLowerCase()}.`,
            link: `/dashboard/discover`
        });

        res.status(200).json({ success: true, request });
    } catch (error) {
        console.error("Handle Access Request Error:", error.message);
        res.status(500).json({ message: "Failed to process access request" });
    }
};

// --- NEW MATCH-BASED VDR METHODS ---

/**
 * @desc    Get user's VDR rooms (where they are participants)
 * @route   GET /api/vdr/my
 */
export const getMyVDR = async (req, res) => {
    try {
        const userId = req.user.id;
        const rooms = await VDRRoom.find({
            $or: [{ startupId: userId }, { investorId: userId }]
        }).populate("startupId investorId", "name email role avatar")
        .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, rooms });
    } catch (error) {
        console.error("Get My VDR Error:", error.message);
        res.status(500).json({ message: "Failed to fetch your VDR rooms" });
    }
};

/**
 * @desc    Fetch or create VDR room for a match
 * @route   GET /api/vdr/room/:matchId
 */
export const getVDRRoomByMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const userId = req.user.id;

        const connection = await Connection.findById(matchId);
        if (!connection || connection.status !== "ACCEPTED") {
            return res.status(403).json({ message: "VDR only accessible for accepted matches" });
        }

        // Validate user is part of connection
        if (connection.sender.toString() !== userId && connection.recipient.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized access to this VDR" });
        }

        const user1 = await User.findById(connection.sender);
        const user2 = await User.findById(connection.recipient);
        
        const startupId = user1.role === "startup" ? user1._id : user2._id;
        const investorId = user1.role === "investor" ? user1._id : user2._id;

        const room = await ensureVDRRoom(matchId, startupId, investorId);
        res.status(200).json({ success: true, room });
    } catch (error) {
        console.error("Get VDR Room Error:", error.message);
        res.status(500).json({ message: "Failed to fetch VDR room" });
    }
};

/**
 * @desc    Get decrypted messages for a room
 * @route   GET /api/vdr/messages/:roomId
 */
export const getVDRMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await VDRRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Security check
        if (room.startupId.toString() !== userId && room.investorId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const messages = await VDRMessage.find({ roomId }).sort({ createdAt: 1 });
        
        // Decrypt messages
        const decryptedMessages = messages.map(m => ({
            ...m._doc,
            message: decryptMessage(m.message, room.encryptionKey)
        }));

        res.status(200).json({ success: true, messages: decryptedMessages });
    } catch (error) {
        console.error("Get VDR Messages Error:", error.message);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

/**
 * @desc    Send encrypted message
 * @route   POST /api/vdr/message
 */
export const sendVDRMessage = async (req, res) => {
    try {
        const { roomId, message } = req.body;
        const userId = req.user.id;

        const room = await VDRRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const user = await User.findById(userId);
        
        // Encrypt message
        const encryptedMessage = encryptMessage(message, room.encryptionKey);

        const vdrMsg = await VDRMessage.create({
            roomId,
            senderId: userId,
            senderRole: user.role === "startup" ? "startup" : "investor",
            message: encryptedMessage
        });

        res.status(201).json({ success: true, message: { ...vdrMsg._doc, message } });
    } catch (error) {
        console.error("Send VDR Message Error:", error.message);
        res.status(500).json({ message: "Failed to send message" });
    }
};

/**
 * @desc    Upload document to VDR
 * @route   POST /api/vdr/upload
 */
export const uploadVDRFile = async (req, res) => {
    try {
        const { roomId, fileName, fileUrl, fileType, category, description, isEncrypted, tags, visibility } = req.body;
        const userId = req.user.id;

        const room = await VDRRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Check for latest version
        const latestFile = await VDRFile.findOne({ roomId, fileName }).sort({ version: -1 });
        const version = latestFile ? latestFile.version + 1 : 1;
        const parentFileId = latestFile ? (latestFile.parentFileId || latestFile._id) : null;

        const file = await VDRFile.create({
            roomId,
            uploadedBy: userId,
            fileName,
            fileUrl,
            fileType,
            category: category || "other",
            description,
            isEncrypted: !!isEncrypted,
            tags: tags || [],
            visibility: visibility || "shared",
            version,
            parentFileId
        });

        res.status(201).json({ success: true, file });
    } catch (error) {
        console.error("Upload VDR File Error:", error.message);
        res.status(500).json({ message: "Failed to upload file" });
    }
};

/**
 * @desc    Update document metadata
 * @route   PATCH /api/vdr/document/:id
 */
export const updateVDRFileMetadata = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags, visibility, description, category } = req.body;
        const userId = req.user.id;

        const file = await VDRFile.findById(id);
        if (!file) return res.status(404).json({ message: "File not found" });

        // Only uploader can update metadata
        if (file.uploadedBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this file" });
        }

        if (tags) file.tags = tags;
        if (visibility) file.visibility = visibility;
        if (description !== undefined) file.description = description;
        if (category) file.category = category;

        await file.save();
        res.status(200).json({ success: true, file });
    } catch (error) {
        console.error("Update VDR Metadata Error:", error.message);
        res.status(500).json({ message: "Failed to update metadata" });
    }
};

/**
 * @desc    Fetch all files for a room
 * @route   GET /api/vdr/documents/:roomId
 */
export const getVDRFiles = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await VDRRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Security check
        if (room.startupId.toString() !== userId && room.investorId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Fetch files based on visibility
        const files = await VDRFile.find({ 
            roomId,
            $or: [
                { visibility: "shared" },
                { uploadedBy: userId } // Private files visible only to uploader
            ]
        }).sort({ uploadedAt: -1 });

        res.status(200).json({ success: true, files });
    } catch (error) {
        console.error("Get VDR Files Error:", error.message);
        res.status(500).json({ message: "Failed to fetch files" });
    }
};

/**
 * @desc    Save structured data field
 * @route   POST /api/vdr/data
 */
export const saveVDRDataField = async (req, res) => {
    try {
        const { roomId, key, value, fieldType, visibility } = req.body;
        const userId = req.user.id;

        const room = await VDRRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        const user = await User.findById(userId);

        const field = await VDRDataField.create({
            roomId,
            createdBy: userId,
            role: user.role === "startup" ? "startup" : "investor",
            key,
            value,
            fieldType: fieldType || "text",
            visibility: visibility || "shared"
        });

        res.status(201).json({ success: true, field });
    } catch (error) {
        console.error("Save VDR Data Error:", error.message);
        res.status(500).json({ message: "Failed to save data" });
    }
};

/**
 * @desc    Fetch visible data fields
 * @route   GET /api/vdr/data/:roomId
 */
export const getVDRDataFields = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.id;

        const room = await VDRRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        // Security check
        if (room.startupId.toString() !== userId && room.investorId.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const fields = await VDRDataField.find({
            roomId,
            $or: [
                { visibility: "shared" },
                { createdBy: userId }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: fields });
    } catch (error) {
        console.error("Get VDR Data Error:", error.message);
        res.status(500).json({ message: "Failed to fetch data" });
    }
};

/**
 * @desc    Update data field value
 * @route   PATCH /api/vdr/data/:id
 */
export const updateVDRDataField = async (req, res) => {
    try {
        const { id } = req.params;
        const { value, visibility } = req.body;
        const userId = req.user.id;

        const field = await VDRDataField.findById(id);
        if (!field) return res.status(404).json({ message: "Field not found" });

        if (field.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this field" });
        }

        if (value !== undefined) field.value = value;
        if (visibility) field.visibility = visibility;

        await field.save();
        res.status(200).json({ success: true, field });
    } catch (error) {
        console.error("Update VDR Data Error:", error.message);
        res.status(500).json({ message: "Failed to update data" });
    }
};
