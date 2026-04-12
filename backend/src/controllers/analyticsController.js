import Event from "../models/Event.js";
import AnalyticsStartup from "../models/AnalyticsStartup.js";
import AnalyticsInvestor from "../models/AnalyticsInvestor.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import mongoose from "mongoose";

// @desc    Startup Performance Dashboard
// @route   GET /api/analytics/startup
export const getStartupAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = Number(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const startup = await Startup.findOne({ userId });
        if (!startup) return res.status(404).json({ message: "Startup profile not found" });

        // Aggregate trend data from Event model
        const trend = await Event.aggregate([
            {
                $match: {
                    targetId: startup._id,
                    targetType: "startup",
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    views: { $sum: { $cond: [{ $eq: ["$type", "profile_view"] }, 1, 0] } },
                    saves: { $sum: { $cond: [{ $eq: ["$type", "save_profile"] }, 1, 0] } },
                    meetings: { $sum: { $cond: [{ $eq: ["$type", "meeting_booked"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const summary = await AnalyticsStartup.findOne({ startupId: startup._id });

        res.status(200).json({ 
            success: true, 
            summary: summary || {},
            trend 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Investor Activity Dashboard
// @route   GET /api/analytics/investor
export const getInvestorAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const days = Number(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const investor = await Investor.findOne({ userId });
        if (!investor) return res.status(404).json({ message: "Investor profile not found" });

        // Aggregate trend data
        const trend = await Event.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId), // Investor is actor
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    views: { $sum: { $cond: [{ $eq: ["$type", "profile_view"] }, 1, 0] } },
                    unlocks: { $sum: { $cond: [{ $eq: ["$type", "contact_unlock"] }, 1, 0] } },
                    matches: { $sum: { $cond: [{ $eq: ["$type", "match_clicked"] }, 1, 0] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const summary = await AnalyticsInvestor.findOne({ investorId: investor._id });

        res.status(200).json({ 
            success: true, 
            summary: summary || {},
            trend 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Track UI Render Counts (Lead Intelligence Monitoring)
// @route   POST /api/analytics/ui-count
export const trackUiCount = async (req, res) => {
    try {
        const { type, totalFetched, totalRendered, role } = req.body;

        console.log("\n=========== UI RENDER COUNT ===========");
        console.log(`Type:     ${type}`);
        console.log(`Role:     ${role}`);
        console.log(`Fetched:  ${totalFetched}`);
        console.log(`Rendered: ${totalRendered}`);
        console.log("=======================================");

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("UI Analytics error:", error.message);
        res.status(500).json({ success: false });
    }
};
