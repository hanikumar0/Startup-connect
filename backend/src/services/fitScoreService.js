
import Match from "../models/Match.js";
import User from "../models/User.js";

/**
 * Service to calculate AI Fit Score between Startup and Investor
 */
export const calculateFitScore = async (startup, investor) => {
    let score = 50; // Base score
    const reasons = [];
    const warnings = [];

    // 1. Industry Fit (25 points)
    const startupInd = startup.industry?.toLowerCase();
    const investorInds = investor.preferredIndustries?.map(i => i.toLowerCase()) || [];
    
    if (startupInd && (investorInds.includes(startupInd) || investorInds.includes("all"))) {
        score += 25;
        reasons.push(`${startup.industry} sector match`);
    } else if (startupInd && investorInds.length > 0) {
        // Partial match check (e.g. Fintech vs SaaS might have some overlap in some VCs)
        const partialMatch = investorInds.some(ind => startupInd.includes(ind) || ind.includes(startupInd));
        if (partialMatch) {
            score += 15;
            reasons.push(`Partial industry alignment (${startup.industry})`);
        } else {
            score -= 10;
            warnings.push(`Industry mismatch (${startup.industry} not in investor's primary focus)`);
        }
    }

    // 2. Stage Fit (20 points)
    const startupStage = startup.stage;
    const investorStages = investor.preferredStages || [];
    
    if (startupStage && investorStages.includes(startupStage)) {
        score += 20;
        reasons.push(`${startupStage} stage aligned`);
    } else {
        // Map stages to check proximity
        const stageOrder = ["Idea", "MVP", "Seed", "Revenue", "Growth", "Series A", "Series B"];
        const sIndex = stageOrder.indexOf(startupStage);
        const hasNearby = investorStages.some(st => {
            const iIndex = stageOrder.indexOf(st);
            return Math.abs(sIndex - iIndex) <= 1;
        });

        if (hasNearby) {
            score += 10;
            reasons.push("Proximate stage alignment");
        } else {
            score -= 15;
            warnings.push("Different stage focus");
        }
    }

    // 3. Cheque Size Fit (20 points)
    const ask = startup.fundingRequired || 0;
    const min = investor.checkSizeMin || 0;
    const max = investor.checkSizeMax || 0;

    if (ask >= min && ask <= max) {
        score += 20;
        reasons.push("Cheque size aligned with funding ask");
    } else if (ask > 0 && max > 0) {
        if (ask < min) {
            score -= 5;
            warnings.push("Cheque size might be too high for your current ask");
        } else {
            score -= 15;
            warnings.push("Funding required exceeds investor's typical cheque size");
        }
    }

    // 4. Geography Fit (15 points)
    const startupLoc = startup.location?.toLowerCase();
    const investorGeos = investor.preferredGeographies?.map(g => g.toLowerCase()) || [];
    
    if (startupLoc && (investorGeos.includes(startupLoc) || investorGeos.includes("global") || investorGeos.includes("remote"))) {
        score += 15;
        reasons.push("Geography match");
    } else if (investorGeos.length > 0) {
        score -= 10;
        warnings.push("Outside geography preference");
    }

    // 5. Activity Score (10 points bonus)
    if (investor.userId) {
        const investorUser = await User.findById(investor.userId);
        if (investorUser && investorUser.lastLogin) {
            const daysSinceLogin = (Date.now() - new Date(investorUser.lastLogin).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceLogin <= 7) {
                score += 10;
                reasons.push("Recently active investor");
            } else if (daysSinceLogin > 30) {
                warnings.push("Investor inactive recently");
            }
        }
    }

    // 6. Traction Bonus (up to 10 points)
    if (startup.metrics?.mrr > 0 || startup.revenue > 0) {
        score += 10;
        reasons.push("Strong traction signal");
    }

    // Final Normalize
    score = Math.min(100, Math.max(0, score));

    // Category
    let category = "Low Fit";
    if (score >= 85) category = "Excellent Fit";
    else if (score >= 70) category = "Strong Fit";
    else if (score >= 50) category = "Moderate Fit";

    // Save or Update Match record
    const matchData = {
        startupId: startup._id,
        investorId: investor._id,
        score,
        reasons,
        warnings,
        category,
        lastMatchedAt: new Date()
    };

    await Match.findOneAndUpdate(
        { startupId: startup._id, investorId: investor._id },
        matchData,
        { upsert: true, new: true }
    );

    return matchData;
};

export default { calculateFitScore };
