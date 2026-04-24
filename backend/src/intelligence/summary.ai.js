import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../../", ".env") });

let genAI = null;
let openai = null;
let providerStatus = { gemini: 'unknown', openai: 'unknown' };

// Initialize providers
const initAIProviders = () => {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10 && !process.env.GEMINI_API_KEY.includes('your')) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        providerStatus.gemini = 'ok';
    }
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 10 && !process.env.OPENAI_API_KEY.includes('your')) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        providerStatus.openai = 'ok';
    }
};

initAIProviders();

export const summarizeArticle = async (title, snippet) => {
    // 1. Try Gemini
    if (genAI && providerStatus.gemini === 'ok') {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Analyze this startup news: Title: ${title} Snippet: ${snippet}. JSON format: {"summary": "2 lines", "insights": "1 line"}`;
            
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) return JSON.parse(jsonMatch[0]);
        } catch (error) {
            if (error.status === 403 || error.message?.includes("suspended")) {
                providerStatus.gemini = 'failed';
                console.warn("[Summary AI] Gemini suspended. Switching to backup.");
            }
        }
    }

    // 2. Fallback to OpenAI
    if (openai && providerStatus.openai === 'ok') {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `Summarize this startup news in JSON {"summary": "2 lines", "insights": "1 line"}: ${title} - ${snippet}` }],
                response_format: { type: "json_object" }
            });
            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            providerStatus.openai = 'failed';
            console.error("[Summary AI] OpenAI fallback failed:", error.message);
            if (error.response) console.error("[Summary AI] OpenAI Status:", error.response.status, error.response.data);
        }
    }

    // 3. Final Fallback (Local Rule-based Summary)
    return generateLocalSummary(title, snippet);
};

/**
 * Generates a non-AI summary using text manipulation
 */
const generateLocalSummary = (title, text) => {
    // Extract first two sentences or first 150 chars
    const cleanText = (text || title).replace(/[\r\n]+/g, ' ').trim();
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.length > 20);
    const summary = sentences.length >= 2 
        ? `${sentences[0]}. ${sentences[1]}.`.substring(0, 180)
        : cleanText.substring(0, 160) + "...";

    // Simple keyword extraction for insights
    const keywords = ["startup", "funding", "launch", "hiring", "innovation", "growth", "tech"];
    const found = keywords.filter(k => cleanText.toLowerCase().includes(k)).slice(0, 2);
    const insights = found.length > 0 
        ? `Focus on ${found.join(" and ")} in the current market cycle.`
        : "Market activity detected in the startup ecosystem.";

    return {
        summary: summary,
        insights: insights
    };
};
