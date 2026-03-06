import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";
import Connection from "../models/Connection.js";
import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const AI_TIMEOUT = 15000; // 15 seconds

/**
 * Helper to enrich matches with connection status
 */
const enrichWithConnectionStatus = async (matches, userId, entityKey) => {
    const [sentRequests, receivedRequests] = await Promise.all([
        Connection.find({ sender: userId }).lean(),
        Connection.find({ recipient: userId }).lean(),
    ]);

    return matches.map(match => {
        const partnerId = match[entityKey]?.id?.toString();
        const sent = sentRequests.find(conn => conn.recipient.toString() === partnerId);
        const received = receivedRequests.find(conn => conn.sender.toString() === partnerId);

        let connectionStatus = "NONE";
        let connectionId = null;

        if (received && received.status === "PENDING") {
            connectionStatus = "RECEIVED_PENDING";
            connectionId = received._id;
        } else if (sent) {
            connectionStatus = sent.status;
            connectionId = sent._id;
        } else if (received) {
            connectionStatus = `RECEIVED_${received.status}`;
            connectionId = received._id;
        }

        return { ...match, connectionStatus, connectionId };
    });
};

/**
 * Enhanced AI Matching for Startups
 */
export const getMatchesForStartup = async (req, res) => {
    try {
        const userId = req.user.id;
        const startup = await StartupProfile.findOne({ userId });

        if (!startup) {
            return res.status(404).json({ message: "Startup profile not found" });
        }

        const investors = await InvestorProfile.find().populate("userId", "name email").lean();

        if (investors.length === 0) {
            return res.status(200).json({ success: true, matches: [] });
        }

        const sourceProfile = {
            id: startup._id.toString(),
            text_content: `Company: ${startup.companyName}. Industry: ${startup.industry}. Bio: ${startup.description}. Stage: ${startup.fundingStage}. Tags: ${startup.tags?.join(", ")}`,
            metadata: { industry: startup.industry, stage: startup.fundingStage }
        };

        const candidateProfiles = investors.map(inv => ({
            id: inv._id.toString(),
            text_content: `Investor: ${inv.firmName}. Focus: ${inv.industries?.join(", ")}. Bio: ${inv.bio}. Type: ${inv.investorType}. Stages: ${inv.fundingStages?.join(", ")}`,
            metadata: { industry: inv.industries?.[0], type: inv.investorType }
        }));

        let matches = [];
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/match`, {
                source_profile: sourceProfile,
                candidate_profiles: candidateProfiles,
                top_n: 20
            }, { timeout: AI_TIMEOUT });

            if (aiResponse.data?.success) {
                matches = aiResponse.data.matches.map(match => {
                    const investor = investors.find(i => i._id.toString() === match.id);
                    if (!investor) return null;
                    return {
                        investor: {
                            id: investor.userId?._id,
                            name: investor.userId?.name,
                            firm: investor.firmName,
                            type: investor.investorType,
                            industry: investor.industries?.[0]
                        },
                        score: match.score,
                        reasoning: match.reasoning,
                        isSemantic: true
                    };
                }).filter(Boolean);
            }
        } catch (aiError) {
            console.warn("⚠️ AI Service unavailable, using heuristic matching:", aiError.message);
            matches = investors.map((investor) => {
                let score = 0;
                if (investor.industries?.includes(startup.industry)) score += 40;
                if (investor.fundingStages?.includes(startup.fundingStage)) score += 30;
                if (startup.fundingRequired >= investor.minInvestment && startup.fundingRequired <= investor.maxInvestment) score += 20;

                return {
                    investor: {
                        id: investor.userId?._id,
                        name: investor.userId?.name,
                        firm: investor.firmName,
                        type: investor.investorType,
                        industry: investor.industries?.[0]
                    },
                    score: Math.min(score, 100),
                    reasoning: "Matched based on industry and stage preferences",
                    isSemantic: false
                };
            });
        }

        const enrichedMatches = await enrichWithConnectionStatus(matches, userId, "investor");
        const sortedMatches = enrichedMatches.sort((a, b) => b.score - a.score).filter(m => m.score > 20);

        res.status(200).json({ success: true, matches: sortedMatches });
    } catch (error) {
        console.error("Startup Matching Error:", error.message);
        res.status(500).json({ message: "Failed to fetch matches" });
    }
};

/**
 * Enhanced AI Matching for Investors
 */
export const getMatchesForInvestor = async (req, res) => {
    try {
        const userId = req.user.id;
        const investor = await InvestorProfile.findOne({ userId });

        if (!investor) {
            return res.status(404).json({ message: "Investor profile not found" });
        }

        const startups = await StartupProfile.find().populate("userId", "name email").lean();

        if (startups.length === 0) {
            return res.status(200).json({ success: true, matches: [] });
        }

        const sourceProfile = {
            id: investor._id.toString(),
            text_content: `Investor: ${investor.firmName}. Focus: ${investor.industries?.join(", ")}. Bio: ${investor.bio}. Type: ${investor.investorType}. Stages: ${investor.fundingStages?.join(", ")}`,
            metadata: { industry: investor.industries?.[0], type: investor.investorType }
        };

        const candidateProfiles = startups.map(startup => ({
            id: startup._id.toString(),
            text_content: `Company: ${startup.companyName}. Industry: ${startup.industry}. Bio: ${startup.description}. Stage: ${startup.fundingStage}. Tags: ${startup.tags?.join(", ")}`,
            metadata: { industry: startup.industry, stage: startup.fundingStage }
        }));

        let matches = [];
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/match`, {
                source_profile: sourceProfile,
                candidate_profiles: candidateProfiles,
                top_n: 20
            }, { timeout: AI_TIMEOUT });

            if (aiResponse.data?.success) {
                matches = aiResponse.data.matches.map(match => {
                    const startup = startups.find(s => s._id.toString() === match.id);
                    if (!startup) return null;
                    return {
                        startup: {
                            id: startup.userId?._id,
                            name: startup.companyName,
                            founder: startup.userId?.name,
                            industry: startup.industry,
                            stage: startup.fundingStage
                        },
                        score: match.score,
                        reasoning: match.reasoning,
                        isSemantic: true
                    };
                }).filter(Boolean);
            }
        } catch (aiError) {
            console.warn("⚠️ AI Service unavailable, using heuristic matching:", aiError.message);
            matches = startups.map((startup) => {
                let score = 0;
                if (investor.industries?.includes(startup.industry)) score += 40;
                if (investor.fundingStages?.includes(startup.fundingStage)) score += 30;
                if (startup.fundingRequired >= investor.minInvestment && startup.fundingRequired <= investor.maxInvestment) score += 20;

                return {
                    startup: {
                        id: startup.userId?._id,
                        name: startup.companyName,
                        founder: startup.userId?.name,
                        industry: startup.industry,
                        stage: startup.fundingStage
                    },
                    score: Math.min(score, 100),
                    reasoning: "Matched based on stated preferences",
                    isSemantic: false
                };
            });
        }

        const enrichedMatches = await enrichWithConnectionStatus(matches, userId, "startup");
        const sortedMatches = enrichedMatches.sort((a, b) => b.score - a.score).filter(m => m.score > 20);

        res.status(200).json({ success: true, matches: sortedMatches });
    } catch (error) {
        console.error("Investor Matching Error:", error.message);
        res.status(500).json({ message: "Failed to fetch matches" });
    }
};

/**
 * Analyze Pitch Text with fallback
 */
export const analyzePitch = async (req, res) => {
    try {
        const { pitchText } = req.body;
        if (!pitchText) {
            return res.status(400).json({ message: "Pitch text is required" });
        }

        try {
            const response = await axios.post(`${AI_SERVICE_URL}/analyze-pitch`, {
                pitch_text: pitchText
            }, { timeout: AI_TIMEOUT });

            if (response.data?.success) {
                return res.status(200).json({
                    success: true,
                    analysis: response.data.analysis
                });
            }
        } catch (aiError) {
            console.warn("⚠️ AI Pitch Analysis unavailable:", aiError.message);
        }

        // Fallback response
        res.status(200).json({
            success: true,
            analysis: {
                score: 50,
                feedback: ["AI analysis is temporarily unavailable. Please try again in a few minutes."],
                strengths: ["You submitted a pitch for review."],
                word_count: pitchText.split(/\s+/).length,
                isFallback: true
            }
        });
    } catch (error) {
        console.error("Pitch Analysis Error:", error.message);
        res.status(500).json({ message: "Failed to analyze pitch" });
    }
};
