import axios from "axios";

const AI_SERVICE_URL = "http://127.0.0.1:8000";

export const analyzePitch = async (req, res) => {
    try {
        const { pitchText } = req.body;

        if (!pitchText) {
            return res.status(400).json({ message: "Pitch text is required" });
        }

        const response = await axios.post(`${AI_SERVICE_URL}/analyze-pitch`, {
            pitch_text: pitchText
        });

        res.status(200).json({ success: true, analysis: response.data.analysis });
    } catch (error) {
        console.error("AI Pitch Analysis Error:", error.message);
        res.status(500).json({ message: "AI service Error" });
    }
};
