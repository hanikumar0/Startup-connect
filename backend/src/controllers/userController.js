import mongoose from "mongoose";
import User from "../models/User.js";
import StartupProfile from "../models/Startup.js";
import InvestorProfile from "../models/Investor.js";
import Notification from "../models/Notification.js";
import Connection from "../models/Connection.js";
import Deal from "../models/Deal.js";
import Meeting from "../models/Meeting.js";
import Conversation from "../models/Conversation.js";

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
            const matchesCount = await Connection.countDocuments({
                $or: [{ sender: userId }, { recipient: userId }],
                status: "ACCEPTED"
            });
            const meetingsCount = await Meeting.countDocuments({
                $or: [{ initiatorId: userId }, { guestId: userId }],
                status: "SCHEDULED",
                startTime: { $gte: new Date() }
            });

            res.status(200).json({
                success: true,
                stats: [
                    { label: "Funding Goal", value: `₹${((profile?.fundingRequired || 0) / 10000000).toFixed(1)}Cr`, icon: "IndianRupee", trend: "Target", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Active Matches", value: matchesCount.toString(), icon: "Target", trend: "Verified", color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Profile Views", value: "0", icon: "Users", trend: "Live", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Meetings", value: meetingsCount.toString(), icon: "Calendar", trend: "Upcoming", color: "text-purple-600", bg: "bg-purple-50" },
                ]
            });
        } else {
            const profile = await InvestorProfile.findOne({ userId });
            const totalInvested = await Deal.aggregate([
                { $match: { investor: new mongoose.Types.ObjectId(userId), stage: "CLOSED" } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            const activeDeals = await Deal.countDocuments({
                investor: userId,
                stage: { $nin: ["CLOSED", "LOST"] }
            });

            const scheduledMeetings = await Meeting.countDocuments({
                $or: [{ initiatorId: userId }, { guestId: userId }],
                status: "SCHEDULED",
                startTime: { $gte: new Date() }
            });

            res.status(200).json({
                success: true,
                stats: [
                    { label: "Total Invested", value: `₹${((totalInvested[0]?.total || 0) / 10000000).toFixed(1)}Cr`, icon: "PieChart", trend: "Portfolio", color: "text-indigo-600", bg: "bg-indigo-50" },
                    { label: "Active Deals", value: activeDeals.toString(), icon: "Zap", trend: "In Pipeline", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "New Matches", value: "0", icon: "Target", trend: "Recent", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Scheduled", value: scheduledMeetings.toString(), icon: "Calendar", trend: "This Week", color: "text-purple-600", bg: "bg-purple-50" },
                ]
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDiscoverableProfiles = async (req, res) => {
    try {
        const { role, page = 1, limit = 8 } = req.query;
        const currentUserId = req.user.id;
        const skip = (Number(page) - 1) * Number(limit);

        let query = { userId: { $ne: currentUserId } };
        let profiles = [];
        let total = 0;

        if (role === "STARTUP") {
            total = await StartupProfile.countDocuments(query);
            profiles = await StartupProfile.find(query)
                .populate('userId', 'name email verificationStatus gstNumber udyamNumber dpiitNumber')
                .skip(skip)
                .limit(Number(limit));
        } else if (role === "INVESTOR") {
            total = await InvestorProfile.countDocuments(query);
            profiles = await InvestorProfile.find(query)
                .populate('userId', 'name email verificationStatus')
                .skip(skip)
                .limit(Number(limit));
        }

        // Add connection status to each profile
        const sentRequests = await Connection.find({ sender: currentUserId });
        const receivedRequests = await Connection.find({ recipient: currentUserId });

        const profilesWithStatus = profiles.map(profile => {
            const userId = profile.userId?._id?.toString() || profile.userId?.toString();
            if (!userId) {
                return { ...profile._doc, connectionStatus: "NONE", connectionId: null };
            }

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

        res.status(200).json({ 
            success: true, 
            profiles: profilesWithStatus,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendConnectionRequest = async (req, res) => {
    try {
        const { recipientId, message } = req.body;
        const senderId = req.user.id;

        if (recipientId === senderId) return res.status(400).json({ success: false, message: "You cannot connect with yourself" });

        // Check if a connection already exists
        const existing = await Connection.findOne({
            $or: [
                { sender: senderId, recipient: recipientId },
                { sender: recipientId, recipient: senderId }
            ]
        });

        if (existing) {
            if (existing.status === "ACCEPTED") {
                return res.status(400).json({ success: false, message: "You are already connected" });
            }
            if (existing.status === "PENDING") {
                return res.status(400).json({ success: false, message: "Connection request is already pending" });
            }
            
            // If rejected, allow resending
            if (existing.status === "REJECTED") {
                existing.status = "PENDING";
                existing.requestedBy = senderId;
                existing.message = message || "Let's connect!";
                existing.rejectedAt = null;
                existing.sender = senderId; // Reset sender to the one who is currently requesting
                existing.recipient = recipientId;
                await existing.save();
                
                // Create notification
                const sender = await User.findById(senderId);
                await Notification.create({
                    userId: recipientId,
                    sender: senderId,
                    type: "match_request",
                    title: "New Connection Request",
                    message: `${sender.name} wants to connect with you.`,
                    link: "/dashboard/discover"
                });

                return res.status(200).json({ success: true, message: "Request resent", connection: existing });
            }
        }

        const connection = await Connection.create({
            sender: senderId,
            recipient: recipientId,
            requestedBy: senderId,
            message: message || "Let's connect!",
            status: "PENDING"
        });

        // Create notification
        const sender = await User.findById(senderId);
        await Notification.create({
            userId: recipientId,
            sender: senderId,
            type: "match_request",
            title: "New Connection Request",
            message: `${sender.name} wants to connect with you.`,
            link: "/dashboard/discover"
        });

        res.status(201).json({ success: true, message: "Connection request sent", connection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const { status } = req.body; // ACCEPTED or REJECTED
        const userId = req.user.id;

        const connection = await Connection.findById(connectionId);
        if (!connection) return res.status(404).json({ success: false, message: "Connection not found" });

        // Ensure the one responding is the recipient
        if (connection.recipient.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to respond to this request" });
        }

        connection.status = status;
        if (status === "ACCEPTED") {
            connection.acceptedAt = new Date();
            
            // Auto-create conversation
            const existingConversation = await Conversation.findOne({
                participants: { $all: [connection.sender, connection.recipient] }
            });

            if (!existingConversation) {
                await Conversation.create({
                    participants: [connection.sender, connection.recipient],
                    isActive: true
                });
            }

            await Notification.create({
                userId: connection.sender,
                sender: userId,
                type: "match_accepted",
                title: "Connection Accepted",
                message: "Your connection request has been accepted!",
                link: "/dashboard/chat"
            });
        } else if (status === "REJECTED") {
            connection.rejectedAt = new Date();
        }

        await connection.save();

        res.status(200).json({ success: true, message: `Request ${status.toLowerCase()}`, connection });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
                    userId,
                    type: "identity_verified",
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
        }).populate("sender recipient", "name email role avatar");

        const partners = [];

        for (const conn of connections) {
            const partner = conn.sender._id.toString() === userId ? conn.recipient : conn.sender;
            
            // Find conversation
            const conversation = await Conversation.findOne({
                participants: { $all: [userId, partner._id] }
            });

            partners.push({
                id: partner._id,
                name: partner.name,
                role: partner.role,
                avatar: partner.avatar,
                connectionId: conn._id,
                conversationId: conversation?._id || null,
                lastMessage: conversation?.lastMessage || null,
                connectedAt: conn.acceptedAt || conn.updatedAt
            });
        }

        // Sort by last message time or connection date
        partners.sort((a, b) => {
            const timeA = a.lastMessage?.at || a.connectedAt;
            const timeB = b.lastMessage?.at || b.connectedAt;
            return new Date(timeB) - new Date(timeA);
        });

        res.status(200).json({ success: true, connections: partners });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

