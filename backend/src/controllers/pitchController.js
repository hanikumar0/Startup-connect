import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const AI_TIMEOUT = 10000; // 10 seconds

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
                return res.status(200).json({ success: true, analysis: response.data.analysis });
            }
        } catch (aiError) {
            console.warn("⚠️ AI Pitch Analysis unavailable:", aiError.message);
        }

        // ─── Fallback: Heuristic analysis when AI service is down ───
        const wordCount = pitchText.split(/\s+/).length;
        const feedback = [];
        const strengths = [];

        if (wordCount < 20) feedback.push("Pitch is too short. Try explaining your revenue model.");
        else if (wordCount > 150) feedback.push("A bit wordy. Try to get to the point within 100 words.");

        const keywords = ["ai", "market", "problem", "solution", "scale", "revenue", "growth"];
        const missing = keywords.filter(k => !pitchText.toLowerCase().includes(k));
        if (missing.length > 0) feedback.push(`Consider including keywords like: ${missing.slice(0, 3).join(", ")}`);

        const hasEdge = ["moat", "advantage", "competitor", "unique", "differentiated"].some(w => pitchText.toLowerCase().includes(w));
        if (!hasEdge) feedback.push("Missing Competitive Edge: Mention how you are DIFFERENT from existing players.");
        else strengths.push("Clear competitive differentiation.");

        const hasRevenue = ["saas", "subscription", "business model", "monetize", "revenue", "pricing"].some(w => pitchText.toLowerCase().includes(w));
        if (!hasRevenue) feedback.push("Business Model Uncertainty: Clearly state how you plan to make money.");
        else strengths.push("Defined revenue model.");

        res.status(200).json({
            success: true,
            analysis: {
                score: Math.min(Math.max(wordCount * 0.5, 20), 80),
                feedback: feedback.length ? feedback : ["Great start! Your pitch is clear and concise."],
                strengths: strengths.length ? strengths : ["Good professional tone."],
                word_count: wordCount,
                has_edge: hasEdge,
                has_revenue: hasRevenue,
                isFallback: true
            }
        });
    } catch (error) {
        console.error("Pitch Analysis Error:", error.message);
        res.status(500).json({ message: "Failed to analyze pitch. Please try again." });
    }
};
