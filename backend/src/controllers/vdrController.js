import VDRDocument from "../models/VDRDocument.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
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

        const documents = await VDRDocument.find({ owner: startupId });

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
            recipient: doc.owner,
            sender: userId,
            type: "SYSTEM",
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
            recipient: request.user,
            sender: userId,
            type: "SYSTEM",
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

export const getMyVDR = async (req, res) => {
    try {
        const documents = await VDRDocument.find({ owner: req.user.id });
        res.status(200).json({ success: true, documents });
    } catch (error) {
        console.error("Get My VDR Error:", error.message);
        res.status(500).json({ message: "Failed to fetch your documents" });
    }
};
