import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";

/**
 * Calculate match score between a startup and an investor
 */
export const calculateMatchScore = (startup, investor) => {
    let score = 0;
    const reasons = [];

    // 1. Industry Match (30%)
    const startupIndustry = startup.industry?.toLowerCase();
    const investorIndustries = investor.preferredIndustries?.map(i => i.toLowerCase()) || [];
    if (investorIndustries.includes(startupIndustry)) {
        score += 30;
        reasons.push("Matches your industry focus");
    }

    // 2. Stage Match (20%)
    const startupStage = startup.stage?.toLowerCase();
    const investorStages = investor.preferredStages?.map(s => s.toLowerCase()) || [];
    if (investorStages.includes(startupStage)) {
        score += 20;
        reasons.push("Aligned with your investment stage");
    }

    // 3. Funding Match (20%)
    const fundingReq = startup.fundingRequired || 0;
    if (fundingReq >= (investor.checkSizeMin || 0) && fundingReq <= (investor.checkSizeMax || Infinity)) {
        score += 20;
        reasons.push("Within your typical check size");
    }

    // 4. Location Match (10%)
    const startupLoc = startup.location?.toLowerCase();
    const investorLoc = investor.location?.toLowerCase();
    if (startupLoc && investorLoc && (startupLoc.includes(investorLoc) || investorLoc.includes(startupLoc))) {
        score += 10;
        reasons.push("Geographic compatibility");
    }

    // 5. Tags/Keywords Match (10%)
    const startupTags = startup.tags?.map(t => t.toLowerCase()) || [];
    const investorThesis = (investor.investmentThesis || "").toLowerCase();
    const tagMatch = startupTags.some(tag => investorThesis.includes(tag));
    if (tagMatch) {
        score += 10;
        reasons.push("Matches your specific interests/keywords");
    }

    // 6. Basic Structural Similarity (10%)
    // (Placeholder for NLP - currently checking description overlap)
    const startupDesc = (startup.description || "").toLowerCase();
    if (tagMatch || (startupDesc && investorThesis && (startupDesc.includes(investor.firmName?.toLowerCase()) || false))) {
        score += 10;
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

    const investors = await Investor.find({ isPublic: true }).populate("userId", "name avatar");
    
    const matches = investors.map(investor => {
        const { score, reasons } = calculateMatchScore(startup, investor);
        return {
            investor,
            score,
            reasons
        };
    });

    return matches
        .filter(m => m.score > 20) // Only show somewhat relevant matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * Find top matches for an investor
 */
export const getTopStartupsForInvestor = async (investorId, limit = 10) => {
    const investor = await Investor.findById(investorId);
    if (!investor) return [];

    const startups = await Startup.find({ isPublic: true }).populate("userId", "name avatar");
    
    const matches = startups.map(startup => {
        const { score, reasons } = calculateMatchScore(startup, investor);
        return {
            startup,
            score,
            reasons
        };
    });

    return matches
        .filter(m => m.score > 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};
