import cron from "node-cron";
import { importFromProductHunt } from "../scrapers/producthunt.js";
import { importFromGitHub } from "../scrapers/github.js";
import { importFromHackerNews } from "../scrapers/hackernews.js";
import { importFromOpenVC } from "../scrapers/openvc.js";
import importController from "../controllers/importController.js";

/**
 * Scheduler Service
 * Manages automated data ingestion tasks.
 */
class SchedulerService {
    init() {
        console.log("Initializing Scheduler Service...");

        // Every 12 hours: Import Startups (0 0,12 * * *)
        cron.schedule("0 */12 * * *", async () => {
            console.log("[Scheduler] Running Startup Import (Product Hunt, GitHub, HN)...");
            await importFromProductHunt();
            await importFromGitHub();
            await importFromHackerNews();
            console.log("[Scheduler] Startup Import Complete.");
        });

        // Every 24 hours: Import Investors (0 0 * * *)
        cron.schedule("0 0 * * *", async () => {
            console.log("[Scheduler] Running Investor Import (OpenVC)...");
            await importFromOpenVC();
            console.log("[Scheduler] Investor Import Complete.");
        });

        // Every 6 hours: Enrich Data (0 */6 * * *)
        cron.schedule("0 */6 * * *", async () => {
            console.log("[Scheduler] Running Data Enrichment...");
            // Simulate a req/res for the controller method
            await importController.enrichData({}, { json: () => {} });
            console.log("[Scheduler] Data Enrichment Complete.");
        });

        console.log("Scheduler Service Active.");
    }
}

export default new SchedulerService();
