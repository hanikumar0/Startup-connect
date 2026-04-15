import { 
    getTopInvestorsForStartup, 
    getTopStartupsForInvestor 
} from "../services/matchingService.js";
import { getSmartMatches, getAIMatches, trackInteraction } from "../services/smartMatchmakingService.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Connection from "../models/Connection.js";

// @desc    Get matching investors for a specific startup
// @route   GET /api/match/investors/:startupId
export const getMatchesForStartup = async (req, res) => {
    try {
        const matches = await getTopInvestorsForStartup(req.params.startupId);
        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get matching startups for a specific investor
// @route   GET /api/match/startups/:investorId
export const getMatchesForInvestor = async (req, res) => {
    try {
        const matches = await getTopStartupsForInvestor(req.params.investorId);
        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get top matches for the logged-in user
// @route   GET /api/match/me
export const getMyMatches = async (req, res) => {
    try {
        const role = req.user.role.toLowerCase();
        const { page = 1, limit = 8 } = req.query;
        let profile;
        let matches = [];

        if (role === "startup") {
            profile = await Startup.findOne({ userId: req.user.id });
            if (!profile) return res.status(404).json({ success: false, message: "Startup profile not found" });
            matches = await getTopInvestorsForStartup(profile?._id);
        } else if (role === "investor") {
            profile = await Investor.findOne({ userId: req.user.id });
            if (!profile) return res.status(404).json({ success: false, message: "Investor profile not found" });
            matches = await getTopStartupsForInvestor(profile?._id);
        } else {
            return res.status(400).json({ success: false, message: "Invalid role for matching" });
        }

        const skip = (Number(page) - 1) * Number(limit);
        const paginatedMatches = matches.slice(skip, skip + Number(limit));

        // Add connection status
        const currentUserId = req.user.id;
        const sentRequests = await Connection.find({ sender: currentUserId });
        const receivedRequests = await Connection.find({ recipient: currentUserId });

        const matchesWithStatus = paginatedMatches.map(match => {
            const profile = role === "startup" ? match.investor : match.startup;
            const targetUserId = profile.userId?._id?.toString() || profile.userId?.toString();
            
            const sent = sentRequests.find(conn => conn.recipient.toString() === targetUserId);
            const received = receivedRequests.find(conn => conn.sender.toString() === targetUserId);

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
                ...match,
                connectionStatus,
                connectionId
            };
        });

        res.status(200).json({ 
            success: true, 
            data: matchesWithStatus,
            total: matches.length,
            page: Number(page),
            pages: Math.ceil(matches.length / Number(limit))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get smart weighted matches for the current user
// @route   GET /api/match/smart
export const getSmartMatchesForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const matches = await getSmartMatches(userId);

        // Add connection status
        const sentRequests = await Connection.find({ sender: userId });
        const receivedRequests = await Connection.find({ recipient: userId });

        const enrichedMatches = matches.map(match => {
            const profile = match.investor || match.startup;
            const targetUserId = profile.userId?._id?.toString() || profile.userId?.toString();
            
            const sent = sentRequests.find(conn => conn.recipient.toString() === targetUserId);
            const received = receivedRequests.find(conn => conn.sender.toString() === targetUserId);

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
                ...match,
                connectionStatus,
                connectionId
            };
        });

        res.status(200).json({ success: true, data: enrichedMatches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get AI enhanced matches (Behavior Based)
// @route   GET /api/match/ai
export const getAIMatchesForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const matches = await getAIMatches(userId);

        // Add connection status
        const sentRequests = await Connection.find({ sender: userId });
        const receivedRequests = await Connection.find({ recipient: userId });

        const enrichedMatches = matches.map(match => {
            const profile = match.investor || match.startup;
            const targetUserId = profile.userId?._id?.toString() || profile.userId?.toString();
            
            const sent = sentRequests.find(conn => conn.recipient.toString() === targetUserId);
            const received = receivedRequests.find(conn => conn.sender.toString() === targetUserId);

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
                ...match,
                connectionStatus,
                connectionId
            };
        });

        res.status(200).json({ success: true, data: enrichedMatches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Log interaction for behavior learning
// @route   POST /api/match/track
export const logInteraction = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId, action, metadata } = req.body;
        
        await trackInteraction(userId, targetUserId, action, metadata);
        
        res.status(200).json({ success: true, message: "Interaction logged" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
