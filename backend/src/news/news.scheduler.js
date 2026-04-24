import cron from "node-cron";
import { syncAllNewsRotated } from "./serpNews.service.js";

export const initNewsScheduler = () => {
    console.log("Initializing Automated News Intelligence Scheduler...");

    // Every 2 hours: Fetch latest news via SERP
    cron.schedule("0 */2 * * *", async () => {
        console.log("[Schedule] Running Rotating News Sync...");
        await syncAllNewsRotated();
    });

    // Run once on startup
    syncAllNewsRotated();
};
