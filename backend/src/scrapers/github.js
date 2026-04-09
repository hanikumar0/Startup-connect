import axios from "axios";
import Startup from "../models/Startup.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * GitHub Scraper/Importer
 */
export const importFromGitHub = async () => {
    const token = process.env.GITHUB_TOKEN;
    const queries = ["topic:startup", "topic:ai", "topic:saas"];
    
    let importedTotal = 0;
    let updatedTotal = 0;

    for (const q of queries) {
        try {
            const response = await axios.get(
                `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=10`,
                {
                    headers: token ? { Authorization: `token ${token}` } : {}
                }
            );

            const repos = response.data.items;

            for (const repo of repos) {
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
            }
        } catch (error) {
            console.error(`GitHub Import Error for query ${q}:`, error.message);
        }
    }

    return { success: true, imported: importedTotal, updated: updatedTotal };
};
