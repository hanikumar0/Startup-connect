import axios from "axios";
import Startup from "../models/Startup.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";
import IngestionTracker from "../utils/ingestionTracker.js";

export const importFromHackerNews = async (retries = 2) => {
    const tracker = new IngestionTracker("Hacker News");
    console.log("[Hacker News] Starting import...");
    
    try {
        const topStoriesRes = await axios.get("https://hacker-news.firebaseio.com/v0/topstories.json", { timeout: 15000 });
        const topIds = topStoriesRes.data.slice(0, 15);
        tracker.setFetched(topIds.length);

        for (const id of topIds) {
            let itemSuccess = false;
            for (let i = 0; i < retries && !itemSuccess; i++) {
                try {
                    const itemRes = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 8000 });
                    const item = itemRes.data;

                    if (item.url && !item.url.includes("ycombinator.com") && (item.title?.includes("Show HN") || item.title?.includes("Launch HN"))) {
                        const startupData = {
                            startupName: item.title.split(': ').pop().split(' ')[0],
                            tagline: item.title,
                            description: item.title,
                            website: item.url,
                            source: "hackernews",
                            sourceUrl: `https://news.ycombinator.com/item?id=${id}`,
                            industry: "Technology",
                            stage: "Early",
                            status: "approved",
                            isPublic: true
                        };

                        const existing = await deduplicationService.findExistingStartup(startupData);
                        if (existing) {
                            tracker.track("skipped");
                        } else {
                            const enriched = await enrichmentService.enrichRecord(startupData, 'startup');
                            await Startup.create(enriched);
                            tracker.track("inserted");
                        }
                    } else {
                        tracker.track("skipped");
                    }
                    itemSuccess = true;
                } catch (err) {
                    if (i === retries - 1) tracker.track("error");
                    else await new Promise(r => setTimeout(r, 1000));
                }
            }
        }
    } catch (error) {
        console.error("[Hacker News] Global Error:", error.message);
        tracker.track("error");
    }
    return tracker.finish();
};
