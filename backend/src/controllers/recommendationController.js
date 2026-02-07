// src/controllers/recommendationController.js
import { findSimilarProfiles } from "../services/recommendationService.js";

/**
 * GET /recommendations/:profileId?limit=5
 * Returns top‑K similar profiles for the given profileId.
 */
export async function getRecommendations(req, res) {
    try {
        const { profileId } = req.params;
        const limit = parseInt(req.query.limit) || 5;
        const recommendations = await findSimilarProfiles(profileId, limit);
        res.json({ success: true, data: recommendations });
    } catch (err) {
        console.error("Recommendation error:", err);
        res.status(500).json({ success: false, message: "Failed to get recommendations" });
    }
}
