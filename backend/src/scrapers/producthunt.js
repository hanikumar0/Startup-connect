import axios from "axios";
import Startup from "../models/Startup.js";
import deduplicationService from "../services/deduplicationService.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * Product Hunt Scraper/Importer
 */
export const importFromProductHunt = async () => {
    const token = process.env.PRODUCTHUNT_TOKEN;
    if (!token) {
        console.error("PRODUCTHUNT_TOKEN is missing");
        return { success: false, error: "Missing token" };
    }

    // GraphQL query to fetch top posts
    const query = `
    {
      posts(first: 20) {
        edges {
          node {
            name
            tagline
            description
            url
            website
            topics {
              nodes {
                name
              }
            }
          }
        }
      }
    }
    `;

    try {
        const response = await axios.post(
            'https://api.producthunt.com/v2/api/graphql',
            { query },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const posts = response.data.data.posts.edges;
        let importedCount = 0;
        let updatedCount = 0;

        for (const edge of posts) {
            const node = edge.node;
            const startupData = {
                startupName: node.name,
                tagline: node.tagline,
                description: node.description || node.tagline,
                website: node.website,
                source: "producthunt",
                sourceUrl: node.url,
                industry: node.topics.nodes[0]?.name || "Technology",
                tags: node.topics.nodes.map(t => t.name),
                stage: "MVP",
                status: "approved",
                location: "Global",
                isPublic: true
            };

            // Deduplicate
            const existing = await deduplicationService.findExistingStartup(startupData);
            
            if (existing) {
                // Update existing
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
                // Enrich and Create
                const enriched = await enrichmentService.enrichRecord(startupData, 'startup');
                await Startup.create(enriched);
                importedCount++;
            }
        }

        return { success: true, imported: importedCount, updated: updatedCount };
    } catch (error) {
        console.error("Product Hunt Import Error:", error.message);
        return { success: false, error: error.message };
    }
};
