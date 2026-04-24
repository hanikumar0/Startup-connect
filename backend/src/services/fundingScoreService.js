
import Startup from "../models/Startup.js";

/**
 * Calculates AI Funding Readiness Score for a startup
 */
export const calculateReadinessScore = async (startupId) => {
    const startup = await Startup.findById(startupId).populate("userId");
    if (!startup) throw new Error("Startup not found");

    console.log(`[FundingScore] Calculation Started for: ${startup.startupName}`);

    const reasons = [];
    const suggestions = [];
    const breakdown = {
        profile: 0,
        traction: 0,
        team: 0,
        deck: 0,
        metrics: 0
    };

    // 1. Profile Completeness (Max 20 points)
    let profilePoints = 0;
    if (startup.logo) profilePoints += 2;
    if (startup.startupName) profilePoints += 2;
    if (startup.description && startup.description.length > 50) profilePoints += 3;
    if (startup.industry) profilePoints += 2;
    if (startup.location) profilePoints += 2;
    if (startup.website) profilePoints += 2;
    if (startup.socialLinks?.linkedin) profilePoints += 2;
    if (startup.socialLinks?.twitter) profilePoints += 1;
    if (startup.tagline) profilePoints += 2;
    if (startup.foundedYear) profilePoints += 2;
    
    breakdown.profile = Math.min(profilePoints, 20);
    if (profilePoints < 15) suggestions.push("Complete your startup profile to improve trust with investors.");
    else reasons.push("Comprehensive profile establishes baseline credibility.");

    // 2. Team Strength (Max 20 points)
    let teamPoints = 0;
    const members = startup.teamMembers || [];
    if (members.length > 1) {
        teamPoints += 10;
        reasons.push("Multi-founder team reduces execution risk.");
    } else {
        suggestions.push("Consider adding a co-founder to balance skillsets.");
    }
    
    const hasTechnical = members.some(m => 
        m.role?.toLowerCase().includes("cto") || 
        m.role?.toLowerCase().includes("tech") || 
        m.role?.toLowerCase().includes("engineer")
    );
    if (hasTechnical) {
        teamPoints += 10;
        reasons.push("Technical leadership present in core team.");
    } else {
        suggestions.push("Add a technical co-founder or CTO to strengthen product roadmap.");
    }
    
    breakdown.team = teamPoints;

    // 3. Traction Signals (Max 25 points)
    let tractionPoints = 0;
    const m = startup.metrics || {};
    
    if (m.mrr > 0 || startup.revenue > 0) {
        tractionPoints += 10;
        reasons.push("Demonstrated revenue generation.");
    }
    if (m.monthlyActiveUsers > 1000) {
        tractionPoints += 10;
        reasons.push(`${m.monthlyActiveUsers}+ active users shows product-market fit.`);
    } else if (m.monthlyActiveUsers > 0) {
        tractionPoints += 5;
    }
    if (m.waitlistCount > 500) {
        tractionPoints += 5;
        reasons.push("Significant waitlist interest indicates market demand.");
    }

    breakdown.traction = tractionPoints;
    if (tractionPoints < 10) suggestions.push("Focus on growing your user base or early revenue to prove traction.");

    // 4. Pitch Deck Quality (Max 20 points)
    let deckPoints = 0;
    if (startup.pitchDeckUrl) {
        deckPoints += 20;
        reasons.push("Pitch deck provided for professional review.");
    } else {
        suggestions.push("Upload your latest pitch deck to enable detailed investor review.");
    }
    breakdown.deck = deckPoints;

    // 5. Business Metrics (Max 15 points)
    let metricsPoints = 0;
    if (m.burnRate > 0 && m.runwayMonths > 6) {
        metricsPoints += 8;
        reasons.push(`Healthy runway of ${m.runwayMonths} months detected.`);
    } else if (m.runwayMonths > 0) {
        suggestions.push("Extend your runway before approaching major funding rounds.");
    }

    if (m.grossMargin > 50) {
        metricsPoints += 7;
        reasons.push("Strong gross margins (>50%) indicate scalability.");
    }
    breakdown.metrics = metricsPoints;

    // Calculate Total
    const totalScore = breakdown.profile + breakdown.team + breakdown.traction + breakdown.deck + breakdown.metrics;
    
    // Determine Stage
    let stage = "Not Ready";
    if (totalScore >= 90) stage = "Series A Ready";
    else if (totalScore >= 80) stage = "Seed Ready";
    else if (totalScore >= 60) stage = "Pre-Seed Ready";
    else if (totalScore >= 40) stage = "Early Progress";

    // Update Startup
    startup.fundingScore = totalScore;
    startup.fundingStage = stage;
    startup.scoreBreakdown = breakdown;
    startup.scoreReasons = reasons;
    startup.aiSuggestions = suggestions;
    startup.lastCalculatedAt = new Date();

    await startup.save();
    console.log(`[FundingScore] Score Generated: ${totalScore}/100 | Stage: ${stage}`);

    return startup;
};
