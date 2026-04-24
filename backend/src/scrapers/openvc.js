import axios from "axios";
import Investor from "../models/Investor.js";
import deduplicationService from "../services/deduplicationService.js";
import IngestionTracker from "../utils/ingestionTracker.js";

/**
 * OpenVC Scraper/Importer
 */
export const importFromOpenVC = async () => {
    const tracker = new IngestionTracker("OpenVC");
    console.log("[OpenVC] Starting import...");
    
    try {
        const mockDataset = [
            {
                name: "Sequoia Capital", firm: "Sequoia Capital", website: "https://www.sequoiacap.com",
                type: "VC", industries: ["SaaS", "AI", "Fintech", "Healthcare"],
                stages: ["Seed", "Series A", "Series B", "Growth"], location: "Menlo Park, CA",
                minCheck: 1000000, maxCheck: 100000000
            },
            {
                name: "Andreessen Horowitz", firm: "a16z", website: "https://a16z.com",
                type: "VC", industries: ["Crypto", "Bio", "Consumer", "Enterprise"],
                stages: ["Seed", "Series A", "Series B"], location: "Silicon Valley",
                minCheck: 500000, maxCheck: 50000000
            }
        ];
        
        tracker.setFetched(mockDataset.length);

        for (const data of mockDataset) {
            try {
                const investorData = {
                    investorName: data.name, firmName: data.firm, website: data.website,
                    investorType: data.type, preferredIndustries: data.industries, preferredStages: data.stages,
                    location: data.location, checkSizeMin: data.minCheck, checkSizeMax: data.maxCheck,
                    bio: `${data.firm} is a leading venture capital firm.`, source: "openvc", status: "approved", isPublic: true
                };

                const existing = await deduplicationService.findExistingInvestor(investorData);
                if (existing) {
                    await Investor.findByIdAndUpdate(existing._id, {
                        $set: { checkSizeMin: investorData.checkSizeMin, checkSizeMax: investorData.checkSizeMax, preferredIndustries: investorData.preferredIndustries }
                    });
                    tracker.track("skipped"); // Or 'updated' if we had that stat, but Pattern uses skipped for existing
                } else {
                    const enriched = await enrichmentService.enrichRecord(investorData, 'investor');
                    await Investor.create(enriched);
                    tracker.track("inserted");
                }
            } catch (err) {
                tracker.track("error");
            }
        }
        
    } catch (error) {
        console.error("[OpenVC] Error:", error.message);
        tracker.track("error");
    }
    return tracker.finish();
};
