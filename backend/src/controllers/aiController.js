import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";
import Connection from "../models/Connection.js";
import axios from "axios";

const AI_SERVICE_URL = "http://127.0.0.1:8000";

/**
 * Enhanced AI Matching Algorithm
 * Uses semantic similarity via FastAPI service with heuristic fallback
 */
export const getMatchesForStartup = async (req, res) => {
    try {
        const userId = req.user.id;
        const startup = await StartupProfile.findOne({ userId });

        if (!startup) {
            return res.status(404).json({ message: "Startup profile not found" });
        }

        const investors = await InvestorProfile.find().populate("userId", "name email");

        // Construct Source Profile for AI
        const sourceProfile = {
            id: startup._id.toString(),
            text_content: `Company: ${startup.companyName}. Industry: ${startup.industry}. Bio: ${startup.description}. Stage: ${startup.fundingStage}. Tags: ${startup.tags?.join(", ")}`,
            metadata: { industry: startup.industry, stage: startup.fundingStage }
        };

        // Construct Candidate Profiles for AI
        const candidateProfiles = investors.map(inv => ({
            id: inv._id.toString(),
            text_content: `Investor: ${inv.firmName}. Focus: ${inv.industries.join(", ")}. Bio: ${inv.bio}. Type: ${inv.investorType}. Stages: ${inv.fundingStages?.join(", ")}`,
            metadata: { industry: inv.industries[0], type: inv.investorType }
        }));

        let matches = [];
        try {
            // Attempt Semantic Matching via AI Service
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/match`, {
                source_profile: sourceProfile,
                candidate_profiles: candidateProfiles,
                top_n: 20
            });

            if (aiResponse.data.success) {
                const aiMatches = aiResponse.data.matches;
                matches = aiMatches.map(match => {
                    const investor = investors.find(i => i._id.toString() === match.id);
                    return {
                        investor: {
                            id: investor.userId._id,
                            name: investor.userId.name,
                            firm: investor.firmName,
                            type: investor.investorType,
                            industry: investor.industries[0] // Add industry for UI
                        },
                        score: match.score,
                        reasoning: match.reasoning,
                        isSemantic: true
                    };
                });
            }
        } catch (aiError) {
            console.error("AI Service Unavailable, falling back to heuristic matching");
            // HEURISTIC FALLBACK
            matches = investors.map((investor) => {
                let score = 0;
                if (investor.industries.includes(startup.industry)) score += 40;
                if (investor.fundingStages.includes(startup.fundingStage)) score += 30;
                if (startup.fundingRequired >= investor.minInvestment && startup.fundingRequired <= investor.maxInvestment) score += 20;

                return {
                    investor: {
                        id: investor.userId._id,
                        name: investor.userId.name,
                        firm: investor.firmName,
                        type: investor.investorType,
                        industry: investor.industries[0]
                    },
                    score: Math.min(score, 100),
                    reasoning: "Matched based on industry and stage preferences",
                    isSemantic: false
                };
            });
        }

        // Enrich with connection status - PRIORITIZE showing "Accept" if there is an incoming request
        const sentRequests = await Connection.find({ sender: userId });
        const receivedRequests = await Connection.find({ recipient: userId });

        const enrichedMatches = matches.map(match => {
            const partnerId = match.investor.id.toString();
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

            return {
                ...match,
                connectionStatus,
                connectionId
            };
        });

        const sortedMatches = enrichedMatches.sort((a, b) => b.score - a.score).filter(m => m.score > 20);
        res.status(200).json({ success: true, matches: sortedMatches });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMatchesForInvestor = async (req, res) => {
    try {
        const userId = req.user.id;
        const investor = await InvestorProfile.findOne({ userId });

        if (!investor) {
            return res.status(404).json({ message: "Investor profile not found" });
        }

        const startups = await StartupProfile.find().populate("userId", "name email");

        // Construct Source Profile for AI
        const sourceProfile = {
            id: investor._id.toString(),
            text_content: `Investor: ${investor.firmName}. Focus: ${investor.industries.join(", ")}. Bio: ${investor.bio}. Type: ${investor.investorType}. Stages: ${investor.fundingStages?.join(", ")}`,
            metadata: { industry: investor.industries[0], type: investor.investorType }
        };

        // Construct Candidate Profiles for AI
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
            });

            if (aiResponse.data.success) {
                matches = aiResponse.data.matches.map(match => {
                    const startup = startups.find(s => s._id.toString() === match.id);
                    return {
                        startup: {
                            id: startup.userId._id,
                            name: startup.companyName,
                            founder: startup.userId.name,
                            industry: startup.industry,
                            stage: startup.fundingStage
                        },
                        score: match.score,
                        reasoning: match.reasoning,
                        isSemantic: true
                    };
                });
            }
        } catch (aiError) {
            console.error("AI Service Unavailable, falling back to heuristic matching");
            matches = startups.map((startup) => {
                let score = 0;
                if (investor.industries.includes(startup.industry)) score += 40;
                if (investor.fundingStages.includes(startup.fundingStage)) score += 30;
                if (startup.fundingRequired >= investor.minInvestment && startup.fundingRequired <= investor.maxInvestment) score += 20;

                return {
                    startup: {
                        id: startup.userId._id,
                        name: startup.companyName,
                        founder: startup.userId.name,
                        industry: startup.industry,
                        stage: startup.fundingStage
                    },
                    score: Math.min(score, 100),
                    reasoning: "Matched based on stated preferences",
                    isSemantic: false
                };
            });
        }

        // Enrich with connection status - PRIORITIZE showing "Accept" if there is an incoming request
        const sentRequests = await Connection.find({ sender: userId });
        const receivedRequests = await Connection.find({ recipient: userId });

        const enrichedMatches = matches.map(match => {
            const partnerId = match.startup.id.toString();
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

            return {
                ...match,
                connectionStatus,
                connectionId
            };
        });

        const sortedMatches = enrichedMatches.sort((a, b) => b.score - a.score).filter(m => m.score > 20);
        res.status(200).json({ success: true, matches: sortedMatches });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * NEW: Analyze Pitch Text
 */
export const analyzePitch = async (req, res) => {
    try {
        const { pitchText } = req.body;
        if (!pitchText) {
            return res.status(400).json({ message: "Pitch text is required" });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/analyze-pitch`, {
            pitch_text: pitchText
        });

        if (response.data.success) {
            return res.status(200).json({
                success: true,
                analysis: response.data.analysis
            });
        }

        throw new Error("AI analysis failed");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
