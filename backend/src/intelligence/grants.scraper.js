import axios from "axios";
import MarketIntelligence from "../models/MarketIntelligence.js";
import { summarizeArticle } from "./summary.ai.js";

/**
 * Grants Sync (External API Sources)
 * Note: Startup India Schemes are now handled by startupindia.scraper.js
 */
export const syncAllGrants = async () => {
    const startTime = Date.now();
    console.log("[Grants] Global Grants Sync Started...");
    
    // Placeholder for additional external grant APIs
    const sources = [
        // { name: "Example Grant API", url: "https://api.example.com/grants" }
    ];

    if (sources.length === 0) {
        console.log("[Grants] No secondary API sources configured. Startup India is handled independently.");
    }

    for (const source of sources) {
        // Logic for other APIs would go here
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Grants] Global Sync Finished. Duration: ${duration}s`);
};
