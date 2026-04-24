import cron from "node-cron";
import { syncAllNews } from "./news.scraper.js";
import { syncAllEvents } from "./events.scraper.js";
import { syncAllGrants } from "./grants.scraper.js";
import { syncAllMeetupKeywords } from "../scrapers/meetup.scraper.js";
import { scrapeStartupIndia } from "../scrapers/startupindia.scraper.js";
import SearchCache from "../models/SearchCache.js";

/**
 * Executes a sync task with logging and error isolation
 */
const runIsolatedTask = async (taskName, taskFn) => {
    const start = Date.now();
    console.log(`[Scheduler] [${taskName}] Sync Started...`);
    try {
        await taskFn();
        const duration = ((Date.now() - start) / 1000).toFixed(1);
        console.log(`[Scheduler] [${taskName}] Sync Completed successfully in ${duration}s.`);
    } catch (error) {
        console.error(`[Scheduler] [${taskName}] Sync Failed:`, error.message);
    }
};

/**
 * Refreshes the top searched keywords to keep cache fresh
 */
const refreshPopularSearches = async () => {
    try {
        console.log("[Scheduler] Refreshing Popular Searches...");
        const popular = await SearchCache.find().sort({ hitCount: -1 }).limit(10);
        
        for (const item of popular) {
            console.log(`[Scheduler] Refreshing Popular Keyword: ${item.keyword}`);
            await Promise.all([
                scrapeEventbriteBrowser(item.keyword).catch(() => []),
                scrapeMeetupEvents(item.keyword).catch(() => [])
            ]);
        }
    } catch (error) {
        console.error("[Scheduler] Popular Search Refresh Failed:", error.message);
    }
};

export const initIntelligenceScheduler = () => {
    console.log("Initializing Intelligence Hub Scheduler...");

    // News: Every 2 hours
    cron.schedule("0 */2 * * *", async () => {
        await runIsolatedTask("News", syncAllNews);
    });

    // Startup India: Every 6 hours
    cron.schedule("0 */6 * * *", async () => {
        await runIsolatedTask("Startup India", scrapeStartupIndia);
    });

    // Popular Searches: Every 12 hours
    cron.schedule("0 */12 * * *", async () => {
        await runIsolatedTask("Popular Cache Refresh", refreshPopularSearches);
    });

    // Meetup Baseline: Every 12 hours (Reduced from 6)
    cron.schedule("0 */12 * * *", async () => {
        await runIsolatedTask("Meetup Baseline", syncAllMeetupKeywords);
    });

    // Run once on startup (background)
    (async () => {
        console.log("[Scheduler] Running initial ingestion pass...");
        await runIsolatedTask("News", syncAllNews);
        await runIsolatedTask("Startup India", scrapeStartupIndia);
        await runIsolatedTask("Popular Cache Refresh", refreshPopularSearches);
    })();
};
