// src/utils/embedding.js
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get embedding vector for a given text using OpenAI embeddings.
 * @param {string} text - Input text to embed.
 * @returns {Promise<number[]>} - Embedding vector.
 */
export async function getEmbedding(text) {
    if (!text) return [];
    try {
        const response = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data.data[0].embedding;
    } catch (err) {
        console.error("Embedding error:", err);
        return [];
    }
}
