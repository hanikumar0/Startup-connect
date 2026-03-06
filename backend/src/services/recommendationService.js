// src/services/recommendationService.js
import InvestorProfile from "../models/InvestorProfile.js";
import StartupProfile from "../models/StartupProfile.js";
import User from "../models/User.js";
import ProfileEmbedding from "../models/ProfileEmbedding.js";
import { getEmbedding } from "../utils/embedding.js";
import cosineSimilarity from "cosine-similarity";

/**
 * Pull relevant fields from profiles to build a text representation.
 */
function buildProfileText(profile) {
    const parts = [];
    // Startup fields
    if (profile.companyName) parts.push(profile.companyName);
    if (profile.industry) parts.push(profile.industry);
    if (profile.description) parts.push(profile.description);
    if (profile.fundingStage) parts.push(profile.fundingStage);
    if (Array.isArray(profile.tags)) parts.push(...profile.tags);
    // Investor fields
    if (profile.firmName) parts.push(profile.firmName);
    if (profile.investorType) parts.push(profile.investorType);
    if (Array.isArray(profile.industries)) parts.push(...profile.industries);
    if (Array.isArray(profile.fundingStages)) parts.push(...profile.fundingStages);
    if (profile.bio) parts.push(profile.bio);
    return parts.join(" ");
}

/**
 * Determine profile type based on document fields
 */
function getProfileType(profile) {
    if (profile.firmName || profile.investorType) return "investor";
    return "startup";
}

/**
 * Generate embeddings for all profiles and store them in `profileembeddings` collection.
 */
export async function generateAllEmbeddings() {
    await ProfileEmbedding.deleteMany({});

    const investors = await InvestorProfile.find().lean();
    const startups = await StartupProfile.find().lean();
    const all = [...investors, ...startups];

    const bulkOps = [];
    for (const p of all) {
        const text = buildProfileText(p);
        const embedding = await getEmbedding(text);

        if (embedding.length === 0) continue; // Skip if embedding failed

        bulkOps.push({
            insertOne: {
                document: {
                    profileId: p._id,
                    profileType: getProfileType(p),
                    embedding,
                },
            },
        });
    }
    if (bulkOps.length) await ProfileEmbedding.bulkWrite(bulkOps);
    return bulkOps.length;
}

/**
 * Find similar profiles for a given profileId.
 * @param {string} profileId - The profile whose recommendations we want.
 * @param {number} topK - Number of recommendations.
 */
export async function findSimilarProfiles(profileId, topK = 5) {
    try {
        const target = await ProfileEmbedding.findOne({ profileId });
        if (!target || !target.embedding?.length) return [];

        const all = await ProfileEmbedding.find({ profileId: { $ne: profileId } }).lean();

        const scores = all
            .filter(doc => doc.embedding?.length > 0)
            .map((doc) => {
                const sim = cosineSimilarity(target.embedding, doc.embedding);
                return { profileId: doc.profileId, profileType: doc.profileType, score: sim };
            });

        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, topK);
    } catch (error) {
        console.error("Recommendation lookup error:", error.message);
        return [];
    }
}
