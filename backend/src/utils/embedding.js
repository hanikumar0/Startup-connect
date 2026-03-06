// src/utils/embedding.js
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Get embedding vector for a given text using OpenAI embeddings.
 * Updated to use the current OpenAI SDK v4+ API.
 * @param {string} text - Input text to embed.
 * @returns {Promise<number[]>} - Embedding vector.
 */
export async function getEmbedding(text) {
    if (!text) return [];
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
        });
        return response.data[0].embedding;
    } catch (err) {
        console.error("Embedding error:", err.message);
        return [];
    }
}
