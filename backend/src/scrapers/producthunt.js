import axios from "axios";
import Startup from "../models/Startup.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * Product Hunt Scraper/Importer
 */
export const importFromProductHunt = async (retries = 2) => {
    const token = process.env.PRODUCTHUNT_TOKEN;
    if (!token || token.length < 10 || token.includes('your')) {
        console.warn("[ProductHunt] Skipping - Token missing or placeholder");
        return { success: false, error: "Settings missing" };
    }

    console.log("[ProductHunt] Starting import...");
    const query = `{
      posts(first: 20) {
        edges {
          node {
            name tagline description url website
            topics { nodes { name } }
          }
        }
      }
    }`;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post('https://api.producthunt.com/v2/api/graphql', { query }, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
            });

            const posts = response.data?.data?.posts?.edges || [];
            let importedCount = 0;
            let updatedCount = 0;
            let skippedCount = 0;

            for (const edge of posts) {
                try {
                    const node = edge.node;
                    const startupData = {
                        startupName: node.name,
                        tagline: node.tagline,
                        description: node.description || node.tagline,
                        website: node.website || node.url,
                        source: "producthunt",
                        sourceUrl: node.url,
                        industry: node.topics.nodes[0]?.name || "Technology",
                        tags: node.topics.nodes.map(t => t.name),
                        stage: "MVP",
                        status: "approved",
                        location: "Global",
                        isPublic: true
                    };

                    const existing = await deduplicationService.findExistingStartup(startupData);
                    if (existing) {
                        await Startup.findByIdAndUpdate(existing._id, {
                            $set: {
                                tagline: startupData.tagline,
                                description: startupData.description,
                                tags: startupData.tags,
                                sourceUrl: startupData.sourceUrl
                            }
                        });
                        updatedCount++;
                    } else {
                        const enriched = await enrichmentService.enrichRecord(startupData, 'startup');
                        await Startup.create(enriched);
                        importedCount++;
                    }
                } catch (err) {
                    skippedCount++;
                }
            }

            console.log(`[ProductHunt] Success | Imported: ${importedCount} | Updated: ${updatedCount} | Skipped: ${skippedCount}`);
            return { success: true, imported: importedCount, updated: updatedCount };
        } catch (error) {
            if (i === retries - 1) {
                console.error("[ProductHunt] Import Failed:", error.message);
                return { success: false, error: error.message };
            }
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};
