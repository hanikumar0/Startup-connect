import Parser from "rss-parser";
import MarketIntelligence from "../models/MarketIntelligence.js";
import { summarizeArticle } from "./summary.ai.js";

const parser = new Parser();

export const syncRSSFeed = async (feedUrl, type, source) => {
    try {
        console.log(`Syncing RSS Feed: ${source} (${type})`);
        const feed = await parser.parseURL(feedUrl);
        
        const syncPromises = feed.items.map(async (item) => {
            try {
                // Deduplicate by URL or Title
                const exists = await MarketIntelligence.findOne({ 
                    $or: [{ sourceUrl: item.link }, { title: item.title }] 
                });
                
                if (exists) return;

                // Basic categorization based on keywords
                let category = "General";
                const content = (item.contentSnippet || item.content || "").toLowerCase();
                if (content.includes("ai") || content.includes("artificial intelligence")) category = "AI";
                else if (content.includes("fintech") || content.includes("banking")) category = "Fintech";
                else if (content.includes("health") || content.includes("medtech")) category = "Healthtech";
                else if (content.includes("crypto") || content.includes("web3")) category = "Web3";

                // Get AI analysis - summary.ai.js handles its own errors
                const aiData = await summarizeArticle(item.title, item.contentSnippet || item.title);

                return await MarketIntelligence.create({
                    title: item.title,
                    summary: aiData.summary || item.contentSnippet || "No summary available.",
                    source: source,
                    sourceUrl: item.link,
                    type: type,
                    category: category,
                    date: item.pubDate ? new Date(item.pubDate) : new Date(),
                    aiInsights: aiData.insights,
                    tags: item.categories || [],
                    status: "active",
                    targetAudience: "all"
                });
            } catch (err) {
                console.error(`Skipping item "${item.title}" due to error:`, err.message);
            }
        });

        await Promise.all(syncPromises);
        console.log(`Sync completed for ${source}`);
    } catch (error) {
        console.error(`RSS Sync Error [${source}]:`, error.message);
    }
};
