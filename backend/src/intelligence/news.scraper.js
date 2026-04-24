import axios from "axios";
import { syncRSSFeed } from "./rss.service.js";
import MarketIntelligence from "../models/MarketIntelligence.js";
import SearchCache from "../models/SearchCache.js";
import { summarizeArticle } from "./summary.ai.js";

const NEWS_SOURCES = [
    { name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", type: "news" },
    { name: "YourStory", url: "https://yourstory.com/feed", type: "news" }
];

const KEYWORDS = [
    "startup funding India",
    "latest unicorn startups India",
    "venture capital India",
    "startup acquisitions India",
    "AI startup funding",
    "seed rounds fintech India",
    "startup policy india announcements",
    "venture capital trends 2026",
    "global startup ecosystem report",
    "emerging sectors vc investment",
    "saas market analysis india",
    "generative ai investment trends"
];

/**
 * Normalizes and cleans URLs
 */
const normalizeUrl = (url) => {
    try {
        const u = new URL(url);
        u.search = ""; // Remove tracking params
        return u.toString().toLowerCase();
    } catch (e) {
        return url.toLowerCase();
    }
};

/**
 * Advanced SerpNews Sync with Upsert and Detailed Logging
 */
export const syncSerpNews = async (query = "startup funding india", retries = 2) => {
    const apiKey = process.env.SERP_API_KEY;
    if (!apiKey || apiKey.length < 10 || apiKey.includes('your')) {
        console.warn(`[SerpNews] Skipping "${query}" - API Key missing`);
        return;
    }

    console.log(`[SerpNews] Query Started: "${query}"`);
    let stats = { fetched: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 };

    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(`https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(query)}&api_key=${apiKey}`, { timeout: 15000 });
            const newsResults = response.data.news_results || [];
            stats.fetched = newsResults.length;

            // Process more records (limit to 20 for quality/performance)
            for (const article of newsResults.slice(0, 20)) {
                try {
                    const title = (article.title || "").trim();
                    const rawLink = article.link || article.url;
                    
                    if (!title || !rawLink) {
                        stats.failed++;
                        continue;
                    }

                    const link = normalizeUrl(rawLink);
                    const existing = await MarketIntelligence.findOne({ 
                        $or: [
                            { sourceUrl: link },
                            { title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
                        ]
                    });

                    // Generate AI summary
                    const aiData = await summarizeArticle(title, article.snippet || title);

                    const newsData = {
                        title: title,
                        summary: aiData.summary || article.snippet || "Summary unavailable",
                        source: article.source?.name || "Google News",
                        sourceUrl: link,
                        imageUrl: article.thumbnail || "https://img.logo.dev/google.com?token=pk_CzUZyVntRvSc1Ejtl5kYbA",
                        tags: query.split(" "),
                        type: query.toLowerCase().includes("trend") || query.toLowerCase().includes("report") || query.toLowerCase().includes("analysis") ? "trend" : "news"
                    };

                    if (existing) {
                        await MarketIntelligence.findByIdAndUpdate(existing._id, { $set: newsData });
                        stats.updated++;
                    } else {
                        await MarketIntelligence.create(newsData);
                        stats.inserted++;
                    }
                } catch (err) {
                    stats.failed++;
                }
            }
            
            console.log(`[SerpNews] Result: Success | Fetched: ${stats.fetched} | New: ${stats.inserted} | Updated: ${stats.updated} | Failed: ${stats.failed}`);
            return;
        } catch (error) {
            if (i === retries - 1) console.error(`[SerpNews] Query Failed: "${query}" | Error: ${error.message}`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};

export const syncAllNews = async () => {
    const startTime = Date.now();
    console.log("[News] Starting Global News Sync...");
    
    for (const source of NEWS_SOURCES) {
        try {
            await syncRSSFeed(source.url, source.type, source.name);
        } catch (e) {}
    }

    for (const query of KEYWORDS) {
        await syncSerpNews(query);
    }

    // 3. Cache Invalidation (Rule 9)
    try {
        await SearchCache.deleteMany({ 
            $or: [
                { keyword: { $regex: /news|startup|funding|unicorn/i } },
                { normalizedKeyword: { $regex: /news|startup|funding|unicorn/i } }
            ]
        });
        console.log("[News] Search Cache invalidated for news-related keywords.");
    } catch (e) {
        console.error("[News] Cache Invalidation Failed:", e.message);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[News] Sync Completed Successfully in ${duration}s`);
};
