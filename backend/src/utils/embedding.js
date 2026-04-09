import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

/**
 * Get embedding vector for a given text using Google Gemini embeddings.
 * @param {string} text - Input text to embed.
 * @returns {Promise<number[]>} - Embedding vector.
 */
export async function getEmbedding(text) {
    if (!text) return [];
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (err) {
        console.error("Gemini Embedding error:", err.message);
        // Fallback to OpenAI if key exists?
        // For now, satisfy "open api not working" by not relying on it.
        return [];
    }
}
