import axios from "axios";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

// @desc    Get AI match for a startup and investor
// @route   POST /api/ai/match
export const getAiMatch = async (req, res) => {
    try {
        const { startupId, investorId } = req.body;
        
        const startup = await Startup.findById(startupId);
        const investor = await Investor.findById(investorId);

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/match`, {
            startup: {
                id: startup._id,
                name: startup.startupName,
                description: startup.description,
                industry: startup.industry,
                stage: startup.stage,
                tags: startup.tags
            },
            investor: {
                id: investor._id,
                name: investor.investorName,
                thesis: investor.investmentThesis,
                preferred_industries: investor.preferredIndustries,
                preferred_stages: investor.preferredStages
            }
        });

        res.status(200).json({ success: true, data: aiResponse.data });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI Service connection error", error: error.message });
    }
};

// @desc    Analyze pitch deck
// @route   POST /api/ai/analyze-pitch
export const analyzePitchDeck = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });

        // Forward to AI Service
        const formData = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formData.append("file", blob, req.file.originalname);

        const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/analyze-pitch`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        res.status(200).json({ success: true, data: aiResponse.data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Pitch analysis failed", error: error.message });
    }
};

// @desc    Get AI Recommendations
// @route   GET /api/ai/recommendations
export const getAiRecommendations = async (req, res) => {
    try {
        const user = req.user;
        let recommendations = [];

        if (user.role === "startup") {
            const startup = await Startup.findOne({ userId: user.id });
            const investors = await Investor.find({ isActive: true }).limit(50);
            
            // Map/Filter by basic criteria first to reduce load
            const result = await axios.post(`${AI_SERVICE_URL}/ai/search`, {
                query: `${startup.industry} ${startup.description}`,
                items: investors.map(inv => ({ 
                    id: inv._id, 
                    name: inv.investorName, 
                    description: inv.investmentThesis,
                    tags: inv.preferredIndustries 
                }))
            });
            recommendations = result.data;
        }

        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Recommendation failure", error: error.message });
    }
};

// @desc    Improve text using AI (Onboarding help)
// @route   POST /api/ai/improve-text
export const improveText = async (req, res) => {
    try {
        const { text, type } = req.body;
        if (!text) return res.status(400).json({ success: false, message: "No text provided" });

        // 1. Try Python AI Service first
        try {
            const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/improve-text`, {
                text,
                type // 'startup_vision' or 'investor_thesis'
            }, { timeout: 5000 });

            if (aiResponse.data && aiResponse.data.improved_text && aiResponse.data.improved_text !== text) {
                return res.status(200).json({ success: true, improvedText: aiResponse.data.improved_text });
            }
        } catch (aiError) {
            console.warn("AI Service unavailable, falling back to direct Gemini integration:", aiError.message);
        }

        // 2. Direct Backend Fallback (Node.js SDK)
        if (process.env.GEMINI_API_KEY) {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

                const context = type === "startup_vision" ? "a startup vision" : "an investment thesis";
                const prompt = `Improve the following text for ${context}. Make it professional, compelling, and concise (max 2-3 sentences).\n\nOriginal: ${text}\n\nImproved:`;

                const result = await model.generateContent(prompt);
                const improved = result.response.text().trim();
                
                return res.status(200).json({ success: true, improvedText: improved });
            } catch (geminiError) {
                console.error("Direct Gemini fallback failed:", geminiError.message);
            }
        }

        // 3. Last Resort: Return original text with a success flag so UI doesn't break
        res.status(200).json({ success: true, improvedText: text });
    } catch (error) {
        res.status(500).json({ success: false, message: "AI Text Improvement failed", error: error.message });
    }
};
