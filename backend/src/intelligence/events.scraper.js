import axios from "axios";
import { chromium } from "playwright";
import MarketIntelligence from "../models/MarketIntelligence.js";
import { summarizeArticle } from "./summary.ai.js";

/**
 * Eventbrite Web Scraper (Playwright)
 * Now accepts a custom query for real-time user search
 */
export const scrapeEventbriteBrowser = async (keyword = "startup", location = "India") => {
    console.log(`[Eventbrite] Live search for: ${keyword} in ${location}`);
    const browser = await chromium.launch({ headless: true });
    
    let results = [];
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        });
        const page = await context.newPage();

        const url = `https://www.eventbrite.com/d/india--${location.toLowerCase().replace(/\s+/g, '-')}/${keyword.toLowerCase().replace(/\s+/g, '-')}-events/`;
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(4000); 

        const scrapedData = await page.evaluate(() => {
            const list = document.querySelectorAll('.discover-search-desktop-card, .search-event-card-wrapper, article');
            return Array.from(list).map(el => {
                const title = el.querySelector('h3, .event-card__title')?.innerText?.trim();
                const link = el.querySelector('a')?.href;
                const date = el.querySelector('.event-card__clamp-line--one, .Typography_variant-body-2__98773')?.innerText?.trim();
                const loc = el.querySelector('.event-card__clamp-line--two, .Typography_variant-body-medium__98773')?.innerText?.trim();
                const img = el.querySelector('img')?.src;
                return { title, link, dateText: date, location: loc, imageUrl: img };
            }).filter(i => i.title && i.link && i.link.includes('eventbrite'));
        });

        for (const item of scrapedData.slice(0, 10)) {
            try {
                const existing = await MarketIntelligence.findOne({ sourceUrl: item.link });
                const aiData = await summarizeArticle(item.title, item.title);
                
                let eventDate = item.dateText ? new Date(item.dateText) : new Date(Date.now() + 1209600000);
                if (isNaN(eventDate.getTime())) eventDate = new Date(Date.now() + 1209600000);

                const data = {
                    title: item.title,
                    summary: aiData.summary || "Summary unavailable",
                    source: "Eventbrite",
                    sourceUrl: item.link,
                    imageUrl: item.imageUrl,
                    type: "event",
                    category: "Conference",
                    eventDate,
                    location: item.location || location,
                    isOnline: (item.location || "").toLowerCase().includes("online"),
                    registerUrl: item.link,
                    aiInsights: aiData.insights,
                    status: "active",
                    platform: "eventbrite"
                };

                let doc;
                if (existing) {
                    doc = await MarketIntelligence.findByIdAndUpdate(existing._id, { $set: data }, { new: true });
                } else {
                    doc = await MarketIntelligence.create(data);
                }
                if (doc) results.push(doc);
            } catch (e) {}
        }
    } catch (error) {
        console.error(`[Eventbrite] Scrape Fail: ${error.message}`);
    } finally {
        await browser.close();
    }
    return results;
};

export const syncAllEvents = async () => {
    const startTime = Date.now();
    const queries = ["startup India", "founder networking", "AI summit"];
    
    for(const q of queries) {
        await scrapeEventbriteBrowser(q);
    }
    
    console.log(`[Events] Background Sync Finished in ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
};
