import axios from "axios";
import Investor from "../models/Investor.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * OpenVC Scraper/Importer
 */
export const importFromOpenVC = async () => {
    try {
        // Mocking fetching from OpenVC dataset
        // In a real scenario, this might be a static JSON file or a specific API endpoint
        const mockDataset = [
            {
                name: "Sequoia Capital",
                firm: "Sequoia Capital",
                website: "https://www.sequoiacap.com",
                type: "VC",
                industries: ["SaaS", "AI", "Fintech", "Healthcare"],
                stages: ["Seed", "Series A", "Series B", "Growth"],
                location: "Menlo Park, CA",
                minCheck: 1000000,
                maxCheck: 100000000
            },
            {
                name: "Andreessen Horowitz",
                firm: "a16z",
                website: "https://a16z.com",
                type: "VC",
                industries: ["Crypto", "Bio", "Consumer", "Enterprise"],
                stages: ["Seed", "Series A", "Series B"],
                location: "Silicon Valley",
                minCheck: 500000,
                maxCheck: 50000000
            }
        ];

        let importedCount = 0;
        let updatedCount = 0;

        for (const data of mockDataset) {
            const investorData = {
                investorName: data.name,
                firmName: data.firm,
                website: data.website,
                investorType: data.type,
                preferredIndustries: data.industries,
                preferredStages: data.stages,
                location: data.location,
                checkSizeMin: data.minCheck,
                checkSizeMax: data.maxCheck,
                bio: `${data.firm} is a leading venture capital firm.`,
                source: "openvc",
                status: "approved",
                isPublic: true
            };

            const existing = await deduplicationService.findExistingInvestor(investorData);
            
            if (existing) {
                await Investor.findByIdAndUpdate(existing._id, {
                    $set: {
                        checkSizeMin: investorData.checkSizeMin,
                        checkSizeMax: investorData.checkSizeMax,
                        preferredIndustries: investorData.preferredIndustries
                    }
                });
                updatedCount++;
            } else {
                const enriched = await enrichmentService.enrichRecord(investorData, 'investor');
                await Investor.create(enriched);
                importedCount++;
            }
        }

        return { success: true, imported: importedCount, updated: updatedCount };
    } catch (error) {
        console.error("OpenVC Import Error:", error.message);
        return { success: false, error: error.message };
    }
};
