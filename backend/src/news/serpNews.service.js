import axios from "axios";
import MarketIntelligence from "../models/MarketIntelligence.js";
import { summarizeArticle } from "../intelligence/summary.ai.js";
import slugify from "slugify";

const QUERIES = [
    { q: "startup funding", category: "Investments", target: "all" },
    { q: "AI startup investment", category: "AI", target: "all" },
    { q: "venture capital India", category: "Venture Capital", target: "investor" },
    { q: "startup grants India", category: "Grants", target: "startup" },
    { q: "seed round fintech", category: "Fintech", target: "all" },
    { q: "startup accelerator", category: "Accelerators", target: "startup" }
];

export const syncNewsByQuery = async (queryObj) => {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey) return;

    console.log(`[SerpNewsService] Searching for: ${queryObj.q}`);
    try {
        const response = await axios.get(`https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(queryObj.q)}&api_key=${apiKey}&tbm=nws`);
        const newsResults = response.data.news_results || [];

        for (const article of newsResults.slice(0, 10)) {
            try {
                // Deduplication
                const exists = await MarketIntelligence.findOne({ 
                    $or: [
                        { sourceUrl: article.link },
                        { title: article.title }
                    ]
                });
                if (exists) {
                    // Update metadata if needed
                    continue;
                }

                const aiData = await summarizeArticle(article.title, article.snippet || article.title);

                const slug = slugify(article.title, { lower: true, strict: true });

                await MarketIntelligence.create({
                    title: article.title,
                    slug: slug,
                    summary: aiData.summary,
                    source: article.source?.name || "Google News",
                    sourceUrl: article.link,
                    imageUrl: article.thumbnail,
                    type: "news",
                    category: queryObj.category,
                    publishedAt: article.date ? new Date(article.date) : new Date(),
                    aiInsights: aiData.insights,
                    status: "active",
                    targetAudience: queryObj.target,
                    platform: "serpapi",
                    tags: [queryObj.category, "Startup", "Market"]
                });
                
                console.log(`✅ Saved News: ${article.title}`);
            } catch (err) {
                console.error("Error processing article:", err.message);
            }
        }
    } catch (error) {
        console.error("SerpNewsService Error:", error.message);
    }
};

export const syncAllNewsRotated = async () => {
    // Implement rotation - fetching 2 queries per cycle
    const now = new Date();
    const cycle = Math.floor(now.getHours() / 2) % 3; // 3 cycles of 2 queries
    const start = cycle * 2;
    const queriesToRun = QUERIES.slice(start, start + 2);
    
    console.log(`[NewsScheduler] Running cycle ${cycle} for queries:`, queriesToRun.map(q => q.q));
    
    for (const q of queriesToRun) {
        await syncNewsByQuery(q);
    }
};
