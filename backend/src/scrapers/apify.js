import { ApifyClient } from 'apify-client';
import Investor from '../models/Investor.js';
import User from '../models/User.js';
import logger from '../config/logger.js';

/**
 * Apify Scraper Service
 * Ingests high-fidelity investor data from institutional sources via Apify Actors.
 */
export const importFromApify = async () => {
    try {
        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        const input = {
            "Firm_Types": ["Venture Capital Investor"],
            "Focus_Areas": ["Artificial Intelligence"],
            "Investment_Stages": ["Seed", "Series A"],
            "Countries": ["United States"],
            "Max_Results": 100,
            "Include_Contacts": true
        };

        logger.info("[Apify] Triggering Investor Discovery Actor (SVdYzqKOwfJT7shHd)...");

        // Run the Actor
        const run = await client.actor("SVdYzqKOwfJT7shHd").call(input);

        // Fetch results
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        let imported = 0;
        for (const item of items) {
            // Check if investor already exists by name or email (if available)
            const exists = await Investor.findOne({
                $or: [
                    { investorName: item.firm_name || item.name },
                    { website: item.website }
                ]
            });

            if (!exists) {
                // Create a ghost user for this institutional profile
                const ghostUser = await User.create({
                    name: item.firm_name || item.name || "Institutional Investor",
                    email: `contact+${Math.random().toString(36).substring(7)}@${(item.website || 'apify.io').replace(/https?:\/\//, '').split('/')[0]}`,
                    role: 'investor',
                    isVerified: true,
                    status: 'active',
                    onboardingCompleted: true
                });

                await Investor.create({
                    userId: ghostUser._id,
                    investorName: item.firm_name || item.name,
                    investorType: "VC",
                    focusSectors: item.sectors || ["AI", "Tech"],
                    investmentStages: item.stages || ["Seed", "Series A"],
                    website: item.website,
                    location: item.location || "United States",
                    bio: item.description || "Institutional capital allocator identified via deep-web discovery.",
                    checkSizeMin: item.min_check || 250000,
                    checkSizeMax: item.max_check || 5000000,
                    status: "approved",
                    isPublic: true,
                    isClaimed: false
                });
                imported++;
            }
        }

        return { success: true, found: items.length, imported };
    } catch (error) {
        logger.error({ err: error }, "[Apify] Extraction failed");
        return { success: false, error: error.message };
    }
};
