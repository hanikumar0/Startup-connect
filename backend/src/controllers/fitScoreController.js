
import Match from "../models/Match.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import { calculateFitScore } from "../services/fitScoreService.js";

// @desc    Calculate Fit Score for a specific pair
// @route   POST /api/ai/fit-score/calculate
export const calculatePairFitScore = async (req, res) => {
    try {
        const { startupId, investorId } = req.body;

        const startup = await Startup.findById(startupId);
        const investor = await Investor.findById(investorId);

        if (!startup || !investor) {
            return res.status(404).json({ success: false, message: "Startup or Investor not found" });
        }

        const match = await calculateFitScore(startup, investor);

        res.status(200).json({ success: true, data: match });
    } catch (error) {
        console.error("[FitScore] Calculation failed", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get top matches for a startup
// @route   GET /api/ai/fit-score/startup/:id
export const getStartupFitMatches = async (req, res) => {
    try {
        const matches = await Match.find({ startupId: req.params.id })
            .populate("investorId")
            .sort({ score: -1 })
            .limit(20);

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get top matches for an investor
// @route   GET /api/ai/fit-score/investor/:id
export const getInvestorFitMatches = async (req, res) => {
    try {
        const matches = await Match.find({ investorId: req.params.id })
            .populate("startupId")
            .sort({ score: -1 })
            .limit(20);

        res.status(200).json({ success: true, data: matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Bulk recalculate for current user
// @route   POST /api/ai/fit-score/refresh
export const refreshMyFitScores = async (req, res) => {
    try {
        const role = req.user.role.toLowerCase();
        let startup, investor;

        if (role === "startup") {
            startup = await Startup.findOne({ userId: req.user.id });
            if (!startup) return res.status(404).json({ success: false, message: "Startup profile not found" });
            
            // For MVP, match with top 50 active investors
            const investors = await Investor.find({ isPublic: true }).limit(50);
            console.log(`[FitScore] Recalculating for Startup: ${startup.startupName} against ${investors.length} investors`);
            
            const results = [];
            for (const inv of investors) {
                results.push(await calculateFitScore(startup, inv));
            }
            return res.status(200).json({ success: true, count: results.length });

        } else if (role === "investor") {
            investor = await Investor.findOne({ userId: req.user.id });
            if (!investor) return res.status(404).json({ success: false, message: "Investor profile not found" });
            
            // For MVP, match with top 50 active startups
            const startups = await Startup.find({ isPublic: true }).limit(50);
            console.log(`[FitScore] Recalculating for Investor: ${investor.investorName} against ${startups.length} startups`);

            const results = [];
            for (const st of startups) {
                results.push(await calculateFitScore(st, investor));
            }
            return res.status(200).json({ success: true, count: results.length });
        }

        res.status(400).json({ success: false, message: "Invalid role" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
