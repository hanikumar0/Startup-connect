import User from "../models/User.js";
import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";
import Notification from "../models/Notification.js";
import Connection from "../models/Connection.js";

export const createStartupProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { companyName, ownerName, teamSize, yearFounded, industry, description, history, fundingStage, fundingRequired, website, tags } = req.body;

        const profile = await StartupProfile.findOneAndUpdate(
            { userId },
            {
                companyName,
                ownerName,
                teamSize,
                yearFounded,
                industry,
                description,
                history,
                fundingStage,
                fundingRequired,
                website,
                tags
            },
            { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, { isProfileCompleted: true });

        res.status(200).json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInvestorProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { firmName, investorType, industries, fundingStages, minInvestment, maxInvestment, bio } = req.body;

        const profile = await InvestorProfile.findOneAndUpdate(
            { userId },
            {
                firmName,
                investorType,
                industries,
                fundingStages,
                minInvestment,
                maxInvestment,
                bio
            },
            { upsert: true, new: true }
        );

        await User.findByIdAndUpdate(userId, { isProfileCompleted: true });

        res.status(200).json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        let profile = null;
        if (user.role === "STARTUP") {
            profile = await StartupProfile.findOne({ userId });
        } else if (user.role === "INVESTOR") {
            profile = await InvestorProfile.findOne({ userId });
        }

        res.status(200).json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileCompleted: user.isProfileCompleted,
                verificationStatus: user.verificationStatus
            },
            profile
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (user.role === "STARTUP") {
            const profile = await StartupProfile.findOne({ userId });
            res.status(200).json({
                success: true,
                stats: [
                    { label: "Funding Goal", value: `$${profile?.fundingRequired?.toLocaleString() || '0'}`, icon: "DollarSign", trend: "0%", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Matches Found", value: "0", icon: "Target", trend: "0 new", color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Profile Views", value: "0", icon: "Users", trend: "0%", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Meetings", value: "0", icon: "Calendar", trend: "None", color: "text-purple-600", bg: "bg-purple-50" },
                ]
            });
        } else {
            const profile = await InvestorProfile.findOne({ userId });
            res.status(200).json({
                success: true,
                stats: [
                    { label: "Total Invested", value: "$0", icon: "PieChart", trend: "$0", color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Active Deals", value: "0", icon: "Zap", trend: "None", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "New Matches", value: "0", icon: "Target", trend: "None", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Scheduled", value: "0", icon: "Calendar", trend: "None", color: "text-purple-600", bg: "bg-purple-50" },
                ]
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDiscoverableProfiles = async (req, res) => {
    try {
        const { role } = req.query;
        const currentUserId = req.user.id;

        let profiles = [];
        if (role === "STARTUP") {
            profiles = await StartupProfile.find({ userId: { $ne: currentUserId } }).populate('userId', 'name email verificationStatus gstNumber udyamNumber dpiitNumber');
        } else if (role === "INVESTOR") {
            profiles = await InvestorProfile.find({ userId: { $ne: currentUserId } }).populate('userId', 'name email verificationStatus');
        }

        // Add connection status to each profile
        const sentRequests = await Connection.find({ sender: currentUserId });
        const receivedRequests = await Connection.find({ recipient: currentUserId });

        const profilesWithStatus = profiles.map(profile => {
            const userId = profile.userId?._id?.toString();
            const sent = sentRequests.find(conn => conn.recipient.toString() === userId);
            const received = receivedRequests.find(conn => conn.sender.toString() === userId);

            let connectionStatus = "NONE";
            let connectionId = null;

            if (received && received.status === "PENDING") {
                connectionStatus = "RECEIVED_PENDING";
                connectionId = received._id;
            } else if (sent) {
                connectionStatus = sent.status;
                connectionId = sent._id;
            } else if (received) {
                connectionStatus = `RECEIVED_${received.status}`;
                connectionId = received._id;
            }

            return {
                ...profile._doc,
                connectionStatus,
                connectionId
            };
        });

        res.status(200).json({ success: true, profiles: profilesWithStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sendConnectionRequest = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const senderId = req.user.id;

        if (recipientId === senderId) return res.status(400).json({ message: "You cannot connect with yourself" });

        // 1. Check if I already sent one
        const sent = await Connection.findOne({ sender: senderId, recipient: recipientId });
        if (sent) return res.status(400).json({ message: "Request already sent" });

        // 2. Check if they already sent me one
        const received = await Connection.findOne({ sender: recipientId, recipient: senderId });
        if (received) {
            return res.status(400).json({
                message: "You have an incoming request from this user. Please accept it in your notifications or on their profile."
            });
        }

        const connection = await Connection.create({
            sender: senderId,
            recipient: recipientId,
            message
        });

        // Create notification
        const sender = await User.findById(senderId);
        await Notification.create({
            recipient: recipientId,
            sender: senderId,
            type: "MATCH",
            title: "New Connection Request",
            message: `${sender.name} wants to connect with you.`,
            link: "/dashboard/discover"
        });

        res.status(201).json({ success: true, connection });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { status } = req.body; // ACCEPTED or REJECTED

        const connection = await Connection.findByIdAndUpdate(connectionId, { status }, { new: true });

        if (status === "ACCEPTED") {
            await Notification.create({
                recipient: connection.sender,
                sender: req.user.id,
                type: "MATCH",
                title: "Connection Accepted",
                message: "Your connection request has been accepted!",
                link: "/dashboard/chat"
            });
        }

        res.status(200).json({ success: true, connection });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const submitVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body; // aadhaarLast4, panNumber, gstNumber etc.

        const user = await User.findByIdAndUpdate(userId, {
            ...updates,
            verificationStatus: "PENDING" // Reset to pending for review
        }, { new: true });

        // Simulated Auto-Verification for MVP (In real app, trigger AI/OCR flow)
        if (updates.panNumber && updates.aadhaarLast4) {
            setTimeout(async () => {
                await User.findByIdAndUpdate(userId, { verificationStatus: "VERIFIED" });
                await Notification.create({
                    recipient: userId,
                    type: "SYSTEM",
                    title: "Profile Verified",
                    message: "Congratulations! Your identity has been verified by the government database.",
                });
            }, 3000);
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePitchDeck = async (req, res) => {
    try {
        const { pitchDeckUrl } = req.body;
        const userId = req.user.id;

        const profile = await StartupProfile.findOneAndUpdate(
            { userId },
            { pitchDeckUrl },
            { new: true }
        );

        if (!profile) return res.status(404).json({ message: "Startup profile not found" });

        res.status(200).json({ success: true, profile });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyConnections = async (req, res) => {
    try {
        const userId = req.user.id;
        const connections = await Connection.find({
            $or: [
                { sender: userId, status: "ACCEPTED" },
                { recipient: userId, status: "ACCEPTED" }
            ]
        }).populate("sender recipient", "name email role");

        const partnersMap = new Map();

        connections.forEach(conn => {
            const partner = conn.sender._id.toString() === userId ? conn.recipient : conn.sender;
            const partnerId = partner._id.toString();

            if (!partnersMap.has(partnerId)) {
                partnersMap.set(partnerId, {
                    id: partner._id,
                    name: partner.name,
                    role: partner.role,
                    connectionId: conn._id
                });
            }
        });

        res.status(200).json({ success: true, connections: Array.from(partnersMap.values()) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

