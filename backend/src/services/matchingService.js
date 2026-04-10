import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import User from "../models/User.js";

/**
 * Calculate match score between a startup and an investor
 */
export const calculateMatchScore = async (startup, investor) => {
    let score = 0;
    const reasons = [];

    // 1. Industry Match (30%)
    const startupIndustry = startup.industry?.toLowerCase();
    const investorIndustries = investor.preferredIndustries?.map(i => i.toLowerCase()) || [];
    if (investorIndustries.includes(startupIndustry)) {
        score += 30;
        reasons.push("Strong industry alignment");
    }

    // 2. Stage Match (20%)
    const startupStage = startup.stage?.toLowerCase();
    const investorStages = investor.preferredStages?.map(s => s.toLowerCase()) || [];
    if (investorStages.includes(startupStage)) {
        score += 20;
        reasons.push("Perfect stage fit");
    }

    // 3. Investment Range Match (20%)
    const fundingReq = startup.fundingRequired || 0;
    if (fundingReq >= (investor.checkSizeMin || 0) && fundingReq <= (investor.checkSizeMax || Infinity)) {
        score += 20;
        reasons.push("Within target check size");
    }

    // 4. Location Match (10%)
    const startupLoc = startup.location?.toLowerCase();
    const investorLoc = investor.location?.toLowerCase();
    if (startupLoc && investorLoc && (startupLoc.includes(investorLoc) || investorLoc.includes(startupLoc))) {
        score += 10;
        reasons.push("Based in your preferred region");
    }

    // 5. Tags/Similarity Match (10%)
    const startupTags = startup.tags?.map(t => t.toLowerCase()) || [];
    const investorThesis = (investor.investmentThesis || "").toLowerCase();
    const tagMatch = startupTags.some(tag => investorThesis.includes(tag));
    if (tagMatch) {
        score += 10;
        reasons.push("Matches your niche focus");
    }

    // 6. Activity Level (10%)
    // Fetch last login from User model
    try {
        const user = await User.findById(investor.userId || startup.userId).select("lastLogin");
        if (user && user.lastLogin) {
            const lastLogin = new Date(user.lastLogin);
            const now = new Date();
            const daysSinceLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLogin <= 7) {
                score += 10;
                reasons.push("Highly active recently");
            } else if (daysSinceLogin <= 30) {
                score += 5;
            }
        }
    } catch (err) {
        console.error("Activity score calculation error:", err);
    }

    return {
        score: Math.min(score, 100),
        reasons
    };
};

/**
 * Find top matches for a startup
 */
export const getTopInvestorsForStartup = async (startupId, limit = 10) => {
    const startup = await Startup.findById(startupId);
    if (!startup) return [];

    const investors = await Investor.find({ isPublic: true, userId: { $exists: true, $ne: null } }).populate("userId", "name avatar lastLogin");
    
    const matchesPromises = investors.map(async (investor) => {
        const { score, reasons } = await calculateMatchScore(startup, investor);
        return {
            investor,
            score,
            reasons
        };
    });

    const matches = await Promise.all(matchesPromises);

    return matches
        .filter(m => m.score > 10)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Find top matches for an investor
 */
export const getTopStartupsForInvestor = async (investorId, limit = 10) => {
    const investor = await Investor.findById(investorId);
    if (!investor) return [];

    const startups = await Startup.find({ isPublic: true, userId: { $exists: true, $ne: null } }).populate("userId", "name avatar lastLogin");
    
    const matchesPromises = startups.map(async (startup) => {
        const { score, reasons } = await calculateMatchScore(startup, investor);
        return {
            startup,
            score,
            reasons
        };
    });

    const matches = await Promise.all(matchesPromises);

    return matches
        .filter(m => m.score > 10)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

