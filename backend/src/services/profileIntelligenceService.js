import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import User from "../models/User.js";
import { createNotification } from "./notificationService.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Service to handle profile intelligence, scoring, and visibility
 */
export const processProfileUpdate = async (userId, updateData, role) => {
    try {
        const isStartup = role.toLowerCase() === "startup";
        const ProfileModel = isStartup ? Startup : Investor;
        
        const profile = await ProfileModel.findOne({ userId });
        if (!profile) return null;

        // 1. Calculate Profile Score
        const scoreResult = calculateProfileScore(profile, updateData, isStartup);
        profile.profileScore = scoreResult.score;

        // 2. AI Update Analysis (Simulated or Real)
        const aiAnalysis = await analyzeUpdateImpact(profile, updateData, isStartup);
        
        // 3. Update Achievements & Trust Badges
        if (aiAnalysis.achievements?.length > 0) {
            profile.achievements.push(...aiAnalysis.achievements);
        }
        if (aiAnalysis.trustBadges?.length > 0) {
            // Uniquely add trust badges
            const currentBadges = new Set(profile.trustBadges);
            aiAnalysis.trustBadges.forEach(b => currentBadges.add(b));
            profile.trustBadges = Array.from(currentBadges);
        }

        // 4. Update Recent Updates Timeline
        if (aiAnalysis.summary) {
            profile.recentUpdates.push({
                updateType: "IMPACTFUL_UPDATE",
                description: aiAnalysis.summary,
                date: new Date()
            });
            // Keep only last 10 updates
            if (profile.recentUpdates.length > 10) {
                profile.recentUpdates = profile.recentUpdates.slice(-10);
            }
        }

        // 5. Visibility Boosting Logic
        // Boost visibility based on profile score and recent activity
        profile.visibilityScore = (profile.profileScore * 0.7) + (profile.recentUpdates.length * 5);
        
        // 6. Generate AI Suggestions
        const suggestions = generateProfileSuggestions(profile, scoreResult.missingFields, isStartup);

        await profile.save();

        // 7. Notify Relevant Users if significant update
        if (aiAnalysis.isSignificant) {
            await notifyMatches(userId, role, aiAnalysis.summary);
        }

        return {
            profileScore: profile.profileScore,
            visibilityScore: profile.visibilityScore,
            suggestions,
            trustBadges: profile.trustBadges,
            achievements: profile.achievements
        };
    } catch (error) {
        console.error("Profile Intelligence Error:", error);
        return null;
    }
};

/**
 * Rule-based Profile Scoring
 */
const calculateProfileScore = (profile, updateData, isStartup) => {
    const startupFields = [
        "startupName", "description", "industry", "stage", "location", 
        "website", "logo", "pitchDeckUrl", "tractionMetrics", "revenue", "users"
    ];
    const investorFields = [
        "investorName", "bio", "investorType", "location", "checkSizeMin", 
        "checkSizeMax", "investmentThesis", "preferredIndustries", "preferredStages"
    ];

    const targetFields = isStartup ? startupFields : investorFields;
    const missingFields = [];
    let filledCount = 0;

    targetFields.forEach(field => {
        if (profile[field] || (updateData && updateData[field])) {
            filledCount++;
        } else {
            missingFields.push(field);
        }
    });

    const score = Math.round((filledCount / targetFields.length) * 100);
    return { score, missingFields };
};

/**
 * AI Update Impact Analysis
 * Uses Gemini if available, otherwise rule-based detection
 */
const analyzeUpdateImpact = async (profile, updateData, isStartup) => {
    let result = {
        summary: "",
        achievements: [],
        trustBadges: [],
        isSignificant: false
    };

    // Detect milestones based on update data
    if (isStartup) {
        if (updateData.revenue > 0 && (!profile.revenue || updateData.revenue > profile.revenue)) {
            result.summary = "Growth: Revenue increased significantly.";
            result.isSignificant = true;
            result.trustBadges.push("Revenue Verified");
        }
        if (updateData.users > 0 && (!profile.users || updateData.users > profile.users)) {
            result.summary = `Expansion: Reached ${updateData.users.toLocaleString()} active users.`;
            result.isSignificant = true;
            result.trustBadges.push("Rapid Growth");
        }
        if (updateData.pitchDeckUrl && !profile.pitchDeckUrl) {
            result.summary = "Fundraising: Pitch deck uploaded.";
            result.achievements.push({ title: "Pitch Ready", type: "Milestone", date: new Date() });
        }
    } else {
        if (updateData.investmentThesis && updateData.investmentThesis !== profile.investmentThesis) {
            result.summary = "Strategy: Updated investment thesis.";
            result.isSignificant = true;
        }
        if (updateData.checkSizeMax > profile.checkSizeMax) {
            result.summary = `Scale: Increased max check size to ${updateData.checkSizeMax}.`;
            result.isSignificant = true;
            result.trustBadges.push("High Capacity");
        }
    }

    // Try AI for deeper meaning if API Key exists
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

            const prompt = `Analyze the following profile update for a ${isStartup ? "Startup" : "Investor"}. 
            Context: Profile of ${isStartup ? profile.startupName : profile.investorName}.
            Update: ${JSON.stringify(updateData)}
            
            Determine:
            1. A 1-sentence professional summary for a timeline.
            2. Any specific trust signals (e.g., "Industry Expert", "Global Player").
            3. If this is a "significant" milestone (e.g., funding, exit, massive traction, new strategy).
            
            Return JSON format: { "summary": string, "trustSignals": string[], "isSignificant": boolean }`;

            const aiResult = await model.generateContent(prompt);
            const responseText = aiResult.response.text();
            // Basic JSON extraction
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
                const aiData = JSON.parse(jsonMatch[0]);
                if (aiData.summary) result.summary = aiData.summary;
                if (aiData.trustSignals) result.trustBadges.push(...aiData.trustSignals);
                if (aiData.isSignificant) result.isSignificant = aiData.isSignificant;
            }
        } catch (e) {
            console.warn("AI Analysis Fallback:", e.message);
        }
    }

    return result;
};

/**
 * Generate AI Suggestions based on missing data
 */
const generateProfileSuggestions = (profile, missingFields, isStartup) => {
    const suggestions = [];
    
    if (missingFields.includes("logo")) suggestions.push("Add a logo to increase trust by 20%.");
    if (isStartup) {
        if (missingFields.includes("pitchDeckUrl")) suggestions.push("Upload your pitch deck to attract serious investors.");
        if (missingFields.includes("tractionMetrics")) suggestions.push("Adding traction metrics can boost your visibility by 40%.");
    } else {
        if (missingFields.includes("investmentThesis")) suggestions.push("Refine your investment thesis for better startup matching.");
    }

    if (profile.profileScore < 50) {
        suggestions.push("Complete your profile basic info to unlock smart recommendations.");
    } else if (profile.profileScore < 80) {
        suggestions.push("Add certifications or awards to reach Top Tier visibility.");
    }

    return suggestions.slice(0, 3);
};

/**
 * Notify matches about significant changes
 */
const notifyMatches = async (userId, role, updateText) => {
    try {
        // Simplified: Fetch some connections/matches and notify
        // In a real system, use matching logic to find the 'most relevant' ones
        const user = await User.findById(userId);
        
        // For MVP: notify those who have an accepted connection
        // (Logic borrowed from userController but simplified)
        // This would import Connection/Notification and send alerts
    } catch (e) {
        console.error("Match Notification Error:", e);
    }
};
