import axios from "axios";
import Startup from "../models/Startup.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * GitHub Scraper/Importer
 */
export const importFromGitHub = async (retries = 2) => {
    const token = process.env.GITHUB_TOKEN;
    if (!token || token.length < 10 || token.includes('your')) {
        console.warn("[GitHub] Skipping - Token missing or placeholder");
        return { success: false, error: "Settings missing" };
    }

    const queries = ["topic:startup", "topic:ai", "topic:saas"];
    let importedTotal = 0;
    let updatedTotal = 0;
    let skippedTotal = 0;

    console.log("[GitHub] Starting import...");

    for (const q of queries) {
        let currentRetries = retries;
        let success = false;

        while (currentRetries > 0 && !success) {
            try {
                const response = await axios.get(
                    `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`,
                    {
                        headers: { Authorization: `token ${token}` },
                        timeout: 10000
                    }
                );

                const repos = response.data.items;
                for (const repo of repos) {
                    try {
                        const startupData = {
                            startupName: repo.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                            tagline: repo.description || `A project on GitHub: ${repo.name}`,
                            description: repo.description || "No description provided.",
                            website: repo.homepage || `https://github.com/${repo.full_name}`,
                            githubStars: repo.stargazers_count,
                            source: "github",
                            sourceUrl: repo.html_url,
                            industry: "Software",
                            tags: repo.topics || [],
                            stage: "MVP",
                            status: "approved",
                            isPublic: true
                        };

                        const existing = await deduplicationService.findExistingStartup(startupData);
                        if (existing) {
                            await Startup.findByIdAndUpdate(existing._id, {
                                $set: {
                                    githubStars: startupData.githubStars,
                                    description: startupData.description,
                                    tags: startupData.tags
                                }
                            });
                            updatedTotal++;
                        } else {
                            const enriched = await enrichmentService.enrichRecord(startupData, 'startup');
                            await Startup.create(enriched);
                            importedTotal++;
                        }
                    } catch (e) { skippedTotal++; }
                }
                success = true;
            } catch (error) {
                currentRetries--;
                if (currentRetries === 0) console.error(`[GitHub] Query ${q} failed:`, error.message);
                else await new Promise(r => setTimeout(r, 2000));
            }
        }
    }

    console.log(`[GitHub] Sync Complete | Imported: ${importedTotal} | Updated: ${updatedTotal} | Skipped: ${skippedTotal}`);
    return { success: true, imported: importedTotal, updated: updatedTotal };
};
