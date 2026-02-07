import VDRDocument from "../models/VDRDocument.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const uploadVDRDocument = async (req, res) => {
    try {
        const { name, category, url, isRestricted, size, fileType } = req.body;
        const userId = req.user.id;

        let aiAnalysis = { summary: "Analyzing...", riskScore: 0, clauses: [] };
        try {
            const aiResponse = await axios.post("http://127.0.0.1:8000/analyze-document", {
                doc_name: name,
                doc_content: `Analyzing ${name} in category ${category}. Highly confidential.`
            });
            if (aiResponse.data.success) {
                aiAnalysis = aiResponse.data.analysis;
            }
        } catch (error) {
            console.error("AI Analysis failed:", error.message);
        }

        const doc = await VDRDocument.create({
            owner: userId,
            name,
            category,
            url,
            isRestricted,
            size,
            fileType,
            authorizedUsers: [userId], // Owner always has access
            aiSummary: aiAnalysis.summary,
            riskScore: aiAnalysis.risk_score || aiAnalysis.riskScore,
            keyClauses: aiAnalysis.clauses
        });

        res.status(201).json({ success: true, document: doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
                url: hasAccess ? doc.url : null // Hide URL if no access
            };
        });

        res.status(200).json({ success: true, documents: processedDocs });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

        // Notify owner
        const requester = await User.findById(userId);
        await Notification.create({
            recipient: doc.owner,
            sender: userId,
            type: "SYSTEM",
            title: "VDR Access Request",
            message: `${requester.name} requested access to ${doc.name}`,
            link: "/dashboard/settings" // Or VDR management page
        });

        res.status(200).json({ success: true, message: "Request sent" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const handleAccessRequest = async (req, res) => {
    try {
        const { documentId, requestId } = req.params;
        const { status } = req.body; // APPROVED or REJECTED
        const userId = req.user.id;

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

        // Notify requester
        await Notification.create({
            recipient: request.user,
            sender: userId,
            type: "SYSTEM",
            title: `VDR Access ${status}`,
            message: `Your request for ${doc.name} was ${status.toLowerCase()}.`,
            link: `/dashboard/discover` // Should go to the startup profile
        });

        res.status(200).json({ success: true, request });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyVDR = async (req, res) => {
    try {
        const documents = await VDRDocument.find({ owner: req.user.id });
        res.status(200).json({ success: true, documents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
