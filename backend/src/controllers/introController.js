
import IntroRequest from "../models/IntroRequest.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { findIntroPaths } from "../services/warmIntroService.js";

// @desc    Request a warm intro
// @route   POST /api/intros/request
export const requestWarmIntro = async (req, res) => {
    try {
        const { targetInvestorId, connectorId, message, startupId } = req.body;

        // Validation
        const startup = await Startup.findById(startupId);
        if (!startup) return res.status(404).json({ success: false, message: "Startup profile not found" });

        // Rate limiting (max 5 pending intros per week) - Simple check for MVP
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentCount = await IntroRequest.countDocuments({ 
            requesterId: req.user.id, 
            createdAt: { $gte: oneWeekAgo } 
        });

        if (recentCount >= 10) {
            return res.status(400).json({ success: false, message: "Weekly warm intro limit reached" });
        }

        const introRequest = await IntroRequest.create({
            startupId,
            investorId: targetInvestorId,
            connectorId,
            requesterId: req.user.id,
            message,
            status: "REQUESTED"
        });

        // Notify Connector
        await Notification.create({
            userId: connectorId,
            type: "intro_request",
            title: "New Intro Request",
            message: `${req.user.name} requested a warm intro to an investor.`,
            metadata: { introRequestId: introRequest._id }
        });

        res.status(201).json({ success: true, data: introRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get available intro paths for an investor
// @route   GET /api/intros/available/:investorId
export const getAvailablePaths = async (req, res) => {
    try {
        const startup = await Startup.findOne({ userId: req.user.id });
        if (!startup) return res.status(404).json({ success: false, message: "Startup profile required" });

        const paths = await findIntroPaths(startup._id, req.params.investorId);

        res.status(200).json({ success: true, data: paths });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Respond to an intro request (Connector)
// @route   POST /api/intros/respond
export const respondToIntro = async (req, res) => {
    try {
        const { introRequestId, status, connectorNote } = req.body; // status: CO_ACCEPTED or CO_DECLINED

        const intro = await IntroRequest.findById(introRequestId).populate("startupId investorId");
        if (!intro) return res.status(404).json({ success: false, message: "Request not found" });

        if (intro.connectorId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized connector" });
        }

        intro.status = status;
        if (connectorNote) intro.connectorNote = connectorNote;
        await intro.save();

        // If accepted, notify both
        if (status === "CO_ACCEPTED") {
            // Notify Startup
            await Notification.create({
                userId: intro.requesterId,
                type: "intro_update",
                title: "Intro Request Accepted",
                message: `${req.user.name} agreed to introduce you.`,
            });

            // Notify Investor (The real intro)
            const investorUser = await Investor.findById(intro.investorId).populate("userId");
            if (investorUser && investorUser.userId) {
                await Notification.create({
                    userId: investorUser.userId._id,
                    type: "warm_intro",
                    title: "Incoming Warm Introduction",
                    message: `${req.user.name} is introducing you to ${intro.startupId.startupName}.`,
                    metadata: { introRequestId: intro._id }
                });
            }
        }

        res.status(200).json({ success: true, data: intro });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get my intro related items
// @route   GET /api/intros/my-requests
export const getMyIntros = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Items I requested
        const requested = await IntroRequest.find({ requesterId: userId })
            .populate("investorId connectorId")
            .sort({ createdAt: -1 });

        // Items awaiting my response (as connector)
        const asConnector = await IntroRequest.find({ connectorId: userId, status: "REQUESTED" })
            .populate("startupId requesterId investorId")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: { requested, asConnector } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
