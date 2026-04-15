import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import User from "../models/User.js";
import UserInteraction from "../models/UserInteraction.js";

const ACTION_WEIGHTS = {
    view: 1,
    connect: 3,
    chat: 5,
    ignore: -3
};

/**
 * Track an interaction for the learning loop
 */
export const trackInteraction = async (userId, targetUserId, action, metadata = {}) => {
    try {
        const weight = ACTION_WEIGHTS[action] || 1;
        await UserInteraction.create({
            userId,
            targetUserId,
            action,
            metadata,
            weight
        });
    } catch (error) {
        console.error("Failed to track interaction:", error);
    }
};

/**
 * Extracts behavior-based preferences for a user
 */
const getUserPreferences = async (userId) => {
    const interactions = await UserInteraction.find({ 
        userId, 
        action: { $ne: "ignore" } 
    }).sort({ createdAt: -1 }).limit(100);

    if (interactions.length === 0) return null;

    const prefs = {
        focus: {},
        tags: {},
        stages: {},
        funding: {}
    };

    interactions.forEach(inter => {
        const w = inter.weight;
        const meta = inter.metadata;

        if (meta.focus) meta.focus.forEach(f => prefs.focus[f] = (prefs.focus[f] || 0) + w);
        if (meta.tags) meta.tags.forEach(t => prefs.tags[t] = (prefs.tags[t] || 0) + w);
        if (meta.stage) prefs.stages[meta.stage] = (prefs.stages[meta.stage] || 0) + w;
    });

    // Get top choices
    const getTop = (obj) => Object.entries(obj).sort((a,b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);

    return {
        focus: getTop(prefs.focus),
        tags: getTop(prefs.tags),
        stages: getTop(prefs.stages)
    };
};

/**
 * Calculates behavioral similarity (AI Score)
 */
const calculateAISimilarity = (prefs, target) => {
    if (!prefs) return 0;
    let score = 0;

    const targetFocus = (target.industry || "").toLowerCase();
    const targetTags = target.tags || [];
    const targetStage = (target.stage || "").toLowerCase();

    // Focus Similarity (40%)
    if (prefs.focus.some(f => targetFocus.includes(f.toLowerCase()))) score += 40;

    // Tags Similarity (30%)
    const tagMatch = targetTags.filter(t => prefs.tags.includes(t)).length;
    if (tagMatch > 0) score += 30;

    // Stage Similarity (30%)
    if (prefs.stages.includes(targetStage)) score += 30;

    return Math.min(score, 100);
};

/**
 * Smart Matchmaking Engine
 * Calculates a weighted score (0-100) based on institutional data
 */
export const calculateSmartMatchScore = (startup, investor, startupUser, investorUser) => {
    let rawScore = 0;
    const reasons = [];

    // --- 1. Focus Match (25%) ---
    const sIndustry = (startup.industry || "").toLowerCase();
    const iIndustries = investor.preferredIndustries?.map(i => i.toLowerCase()) || [];
    let focusScore = 0;
    if (iIndustries.includes(sIndustry)) {
        focusScore = 1;
    } else if (iIndustries.some(i => sIndustry.includes(i) || i.includes(sIndustry))) {
        focusScore = 0.6;
    }
    rawScore += focusScore * 25;
    if (focusScore >= 0.6) reasons.push("Industry Focus Aligned");

    // --- 2. Tag Match (20%) ---
    const sTags = startup.tags?.map(t => t.toLowerCase()) || [];
    const iThesis = (investor.investmentThesis || "").toLowerCase();
    const tagMatchCount = sTags.filter(tag => iThesis.includes(tag)).length;
    const tagScore = Math.min(tagMatchCount / (sTags.length || 1), 1);
    rawScore += tagScore * 20;
    if (tagScore > 0.3) reasons.push("Strategic Interest Overlap");

    // --- 3. Funding Compatibility (20%) ---
    const ask = startup.fundingRequired || 0;
    const min = investor.checkSizeMin || 0;
    const max = investor.checkSizeMax || Infinity;
    let fundingScore = 0;
    if (ask >= min && ask <= max) {
        fundingScore = 1;
    } else if (ask > 0 && (ask >= min * 0.7 && ask <= max * 1.3)) {
        fundingScore = 0.5;
    }
    rawScore += fundingScore * 20;
    if (fundingScore === 1) reasons.push("Capital Requirements Matched");

    // --- 4. Stage Match (10%) ---
    const stageMap = {
        'idea': 1,
        'mvp': 2,
        'seed': 3,
        'pre-seed': 2.5,
        'revenue': 4,
        'growth': 5,
        'series a': 5.5,
        'series b': 6,
        'scaling': 6
    };
    const sStage = stageMap[startup.stage?.toLowerCase()] || 0;
    const iStages = investor.preferredStages?.map(s => stageMap[s.toLowerCase()] || 0) || [];
    let stageScore = 0;
    if (iStages.some(s => s === sStage)) {
        stageScore = 1;
    } else if (iStages.some(s => Math.abs(s - sStage) <= 1)) {
        stageScore = 0.6;
    }
    rawScore += stageScore * 10;
    if (stageScore === 1) reasons.push("Perfect Growth Stage Fit");

    // --- 5. Location Bonus (5%) ---
    const sLoc = (startup.location || "").toLowerCase();
    const iLoc = (investor.location || "").toLowerCase();
    let locationScore = 0;
    if (sLoc === iLoc) {
        locationScore = 1;
    } else if (sLoc.includes(iLoc) || iLoc.includes(sLoc)) {
        locationScore = 0.7;
    }
    rawScore += locationScore * 5;
    if (locationScore > 0) reasons.push("Regional Synergy");

    // --- 6. Profile Quality (5%) ---
    const countFilled = (obj, fields) => fields.filter(f => !!obj[f]).length;
    const sFilled = countFilled(startup, ['description', 'industry', 'stage', 'location', 'website', 'logo', 'tags']);
    const iFilled = countFilled(investor, ['bio', 'investorType', 'location', 'checkSizeMin', 'checkSizeMax', 'investmentThesis']);
    const profileScore = ((sFilled / 7) + (iFilled / 6)) / 2;
    rawScore += profileScore * 5;

    // --- 7. KYC Boost (5%) ---
    const sKYC = startupUser?.kycStatus === "verified" ? 1 : 0.3;
    const iKYC = investorUser?.kycStatus === "verified" ? 1 : 0.3;
    const kycScore = (sKYC + iKYC) / 2;
    rawScore += kycScore * 5;
    if (sKYC === 1 && iKYC === 1) reasons.push("High-Trust Verified Match");

    // --- 8. Activity Score (5%) ---
    const getDaysSinceActive = (lastLogin) => {
        if (!lastLogin) return 100;
        const diff = new Date() - new Date(lastLogin);
        return diff / (1000 * 60 * 60 * 24);
    };
    const sDays = getDaysSinceActive(startupUser?.lastLogin);
    const iDays = getDaysSinceActive(investorUser?.lastLogin);
    const activityMap = (days) => days < 2 ? 1 : days < 7 ? 0.7 : 0.3;
    const activityScore = (activityMap(sDays) + activityMap(iDays)) / 2;
    rawScore += activityScore * 5;
    if (activityScore > 0.8) reasons.push("Recently Active Engagement");

    // --- 9. Institutional History (5%) ---
    const iHistory = (investor.totalInvestments || 0) > 5 ? 1 : 0.5;
    const sHistory = (startup.fundingRaised || 0) > 0 ? 1 : 0.5;
    const historyScore = (iHistory + sHistory) / 2;
    rawScore += historyScore * 5;

    // --- INTELLIGENT BOOSTS ---
    let finalScore = rawScore;
    if (focusScore === 1 && stageScore === 1) finalScore += 10; // Focus + Stage Synergy
    if (sKYC === 1 && iKYC === 1) finalScore += 5; // Double Verified Trust

    const score = Math.min(Math.round(finalScore), 100);

    let label = "Low Match";
    if (score >= 90) label = "Perfect Match";
    else if (score >= 70) label = "Strong Match";
    else if (score >= 50) label = "Good Match";

    return { score, label, reasons };
};

/**
 * Fetch Smart Matches for a User
 */
export const getSmartMatches = async (userId, limit = 20) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isStartup = user.role.toLowerCase() === "startup";
    const myProfile = isStartup 
        ? await Startup.findOne({ userId }) 
        : await Investor.findOne({ userId });

    if (!myProfile) return [];

    const matches = [];

    if (isStartup) {
        const potentialInvestors = await Investor.find({ isPublic: true })
            .populate("userId", "name avatar lastLogin kycStatus");

        for (const investor of potentialInvestors) {
            const result = calculateSmartMatchScore(myProfile, investor, user, investor.userId);
            if (result.score >= 30) {
                matches.push({
                    investor,
                    ...result
                });
            }
        }
    } else {
        const potentialStartups = await Startup.find({ isPublic: true })
            .populate("userId", "name avatar lastLogin kycStatus");

        for (const startup of potentialStartups) {
            const result = calculateSmartMatchScore(startup, myProfile, startup.userId, user);
            if (result.score >= 30) {
                matches.push({
                    startup,
                    ...result
                });
            }
        }
    }

    return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
};

/**
 * AI Recommendation Engine
 * Combines Smart Match Score (70%) with User Behavior Similarity (30%)
 */
export const getAIMatches = async (userId, limit = 20) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const isStartup = user.role.toLowerCase() === "startup";
    const myProfile = isStartup 
        ? await Startup.findOne({ userId }) 
        : await Investor.findOne({ userId });

    if (!myProfile) return [];

    const userPrefs = await getUserPreferences(userId);
    const matches = [];

    // Fetch pool
    const pool = isStartup 
        ? await Investor.find({ isPublic: true }).populate("userId", "name avatar lastLogin kycStatus")
        : await Startup.find({ isPublic: true }).populate("userId", "name avatar lastLogin kycStatus");

    for (const target of pool) {
        const baseResult = isStartup 
            ? calculateSmartMatchScore(myProfile, target, user, target.userId)
            : calculateSmartMatchScore(target, myProfile, target.userId, user);

        // Calculate AI Boost
        const aiSimilarity = calculateAISimilarity(userPrefs, target);
        
        // Final Weighted Score (70% Base + 30% AI)
        const finalScore = Math.round((baseResult.score * 0.7) + (aiSimilarity * 0.3));
        const aiBoost = Math.round(aiSimilarity * 0.3);

        if (finalScore >= 30) {
            const matchData = isStartup ? { investor: target } : { startup: target };
            matches.push({
                ...matchData,
                score: finalScore,
                aiBoost,
                label: finalScore >= 90 ? "Perfect Match" : finalScore >= 70 ? "Strong Match" : finalScore >= 50 ? "Good Match" : "Low Match",
                reasons: baseResult.reasons
            });
        }
    }

    // Sort by score
    const rankedMatches = matches.sort((a, b) => b.score - a.score);

    // Apply Diversity Logic (70% best + 30% random from pool for discovery)
    const topCount = Math.round(limit * 0.7);
    const topMatches = rankedMatches.slice(0, topCount);
    const remaining = rankedMatches.slice(topCount);
    
    // Shuffle remaining for diversity
    const variedMatches = remaining.sort(() => 0.5 - Math.random()).slice(0, limit - topCount);

    return [...topMatches, ...variedMatches].sort((a, b) => b.score - a.score);
};
