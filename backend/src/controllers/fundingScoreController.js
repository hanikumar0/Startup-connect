
import { calculateReadinessScore } from "../services/fundingScoreService.js";
import Startup from "../models/Startup.js";

/**
 * Trigger recalculation of funding score
 */
export const recalculateScore = async (req, res) => {
    try {
        const startup = await Startup.findOne({ userId: req.user.id });
        if (!startup) return res.status(404).json({ success: false, message: "Startup profile not found" });

        const updatedStartup = await calculateReadinessScore(startup._id);
        res.status(200).json({ 
            success: true, 
            message: "Score updated successfully", 
            data: {
                score: updatedStartup.fundingScore,
                stage: updatedStartup.fundingStage,
                breakdown: updatedStartup.scoreBreakdown,
                reasons: updatedStartup.scoreReasons,
                suggestions: updatedStartup.aiSuggestions,
                lastCalculatedAt: updatedStartup.lastCalculatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get current user's funding score
 */
export const getMyScore = async (req, res) => {
    try {
        const startup = await Startup.findOne({ userId: req.user.id });
        if (!startup) return res.status(404).json({ success: false, message: "Startup profile not found" });

        res.status(200).json({ 
            success: true, 
            data: {
                score: startup.fundingScore,
                stage: startup.fundingStage,
                breakdown: startup.scoreBreakdown,
                reasons: startup.scoreReasons,
                suggestions: startup.aiSuggestions,
                lastCalculatedAt: startup.lastCalculatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get funding score for any startup (Admin/Investor with permissions)
 */
export const getStartupScore = async (req, res) => {
    try {
        const { startupId } = req.params;
        const startup = await Startup.findById(startupId);
        if (!startup) return res.status(404).json({ success: false, message: "Startup not found" });

        // Basic visibility check
        if (!startup.isPublic && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.status(200).json({ 
            success: true, 
            data: {
                score: startup.fundingScore,
                stage: startup.fundingStage,
                lastCalculatedAt: startup.lastCalculatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
