import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * Service to research external history of startups and investors using AI.
 * Includes fallback response when OpenAI is unavailable.
 */
export const researchEntityHistory = async (entityName, entityType, founderName = "") => {
    // Try Gemini-powered analysis
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `
                You are a professional Venture Capital Due Diligence Analyst. 
                Research and provide a detailed historical report for the following ${entityType}:
                Name: ${entityName}
                Founder/Key Person: ${founderName}

                Please provide the report in JSON format with the following structure:
                {
                    "trustScore": (Number, 1-100 based on perceived credibility),
                    "summary": "A 3-sentence summary of their external reputation and impact.",
                    "pastFunding": [
                        { "year": "YYYY", "round": "Seed/A/B", "amount": "$ amount", "source": "Lead investor or source" }
                    ],
                    "founderTrackRecord": [
                        { "company": "Past Co Name", "role": "Role", "outcome": "Exit/Pivot/Closure" }
                    ],
                    "verifiedExternalLinks": ["URL 1", "URL 2"],
                    "riskAssessment": "Low/Medium/High",
                    "riskNotes": "Brief explanation of risks if any."
                }

                Note: If you don't have real-time data for this specific entity, provide a realistic analysis based on general industry knowledge.
            `;

            const result = await model.generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (error) {
            console.warn("⚠️ Gemini History Research unavailable:", error.message);
        }
    }

    // Fallback to OpenAI if Gemini fails and key exists
    if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("your_")) {
        try {
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            // ... (rest of OpenAI logic)
        } catch (error) {
            console.warn("⚠️ OpenAI History Research unavailable:", error.message);
        }
    }

    // ─── Fallback: Static due diligence template ───
    return {
        trustScore: 50,
        summary: `Due diligence report for ${entityName} (${entityType}). AI-powered deep analysis is temporarily unavailable. Manual review is recommended.`,
        pastFunding: [],
        founderTrackRecord: founderName ? [
            { company: entityName, role: "Founder", outcome: "Active" }
        ] : [],
        verifiedExternalLinks: [],
        riskAssessment: "Medium",
        riskNotes: "Automated analysis unavailable. Please conduct manual due diligence.",
        isFallback: true
    };
};
