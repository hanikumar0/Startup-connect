import axios from "axios";
import Startup from "../models/Startup.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * Hacker News Scraper/Importer
 */
export const importFromHackerNews = async () => {
    try {
        const topStoriesRes = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json");
        const topIds = topStoriesRes.data.slice(0, 30); // Top 30 stories

        let importedCount = 0;
        let updatedCount = 0;

        for (const id of topIds) {
            const itemRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const item = itemRes.data;

            if (item.url && !item.url.includes("ycombinator.com")) {
                const startupData = {
                    startupName: item.title.split('Show HN: ').pop().split(' ')[0], // Simple heuristic
                    tagline: item.title,
                    description: item.title,
                    website: item.url,
                    source: "hackernews",
                    sourceUrl: `https://news.ycombinator.com/item?id=${id}`,
                    industry: "Technology",
                    stage: "idea",
                    status: "approved",
                    isPublic: true
                };

                const existing = await deduplicationService.findExistingStartup(startupData);
                
                if (existing) {
                    updatedCount++;
                } else {
                    const enriched = await enrichmentService.enrichRecord(startupData, 'startup');
                    await Startup.create(enriched);
                    importedCount++;
                }
            }
        }

        return { success: true, imported: importedCount, updated: updatedCount };
    } catch (error) {
        console.error("Hacker News Import Error:", error.message);
        return { success: false, error: error.message };
    }
};
