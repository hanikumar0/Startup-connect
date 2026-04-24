import { chromium } from "playwright";
import MarketIntelligence from "../models/MarketIntelligence.js";
import { summarizeArticle } from "../intelligence/summary.ai.js";

const KEYWORDS = ["startup events India", "founder meetup", "AI meetup", "entrepreneur networking", "tech meetup", "SaaS conference", "Fintech India"];

export const scrapeMeetupEvents = async (keyword = "startup", retries = 1) => {
    const startTime = Date.now();
    console.log(`[Meetup] Starting scrape for keyword: ${keyword}`);
    
    let stats = { fetched: 0, inserted: 0, updated: 0, skipped: 0, failed: 0 };
    const browser = await chromium.launch({ headless: true });
    
    let results = [];
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 }
        });
        const page = await context.newPage();

        const searchUrl = `https://www.meetup.com/find/events/?keywords=${encodeURIComponent(keyword)}&distance=fiveHundred`;
        
        await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
        await page.waitForTimeout(5000);
        
        await page.evaluate(async () => {
            for(let i=0; i<3; i++) {
                window.scrollBy(0, 1500);
                await new Promise(r => setTimeout(r, 1000));
            }
        });

        const events = await page.evaluate(() => {
            const cards = Array.from(document.querySelectorAll('div[data-testid*="event"], a[id*="event-card"], .ds-test-event-card, [data-event-label]'));
            let data = cards.map(card => {
                const titleEl = card.querySelector('h2, h3, #event-card-title, .Typography-module_headline, .text-gray7');
                const linkEl = card.querySelector('a[href*="/events/"]');
                const imgEl = card.querySelector('img');
                const locEl = card.querySelector('.text-gray6, [data-testid="location-label"]');
                return {
                    title: titleEl?.innerText?.trim(),
                    url: linkEl?.href,
                    image: imgEl?.src,
                    location: locEl?.innerText?.trim()
                };
            });

            if (data.length === 0) {
                const eventLinks = Array.from(document.querySelectorAll('a[href*="/events/"]'));
                data = eventLinks.map(link => ({
                    title: link.innerText?.split('\n')[0]?.trim() || "Meetup Event",
                    url: link.href
                }));
            }
            return data.filter(e => e.title && e.url && e.url.includes('/events/'));
        });

        const uniqueEvents = Array.from(new Map(events.map(item => [item.url, item])).values());
        stats.fetched = uniqueEvents.length;

        for (const event of uniqueEvents.slice(0, 10)) {
            try {
                const existing = await MarketIntelligence.findOne({ sourceUrl: event.url });
                const aiData = await summarizeArticle(event.title, `Meetup event: ${event.title}. Context: ${event.location || 'Technology networking'}`);
                
                const eventData = {
                    title: event.title.trim(),
                    summary: aiData.summary || "Summary unavailable",
                    source: "Meetup",
                    sourceUrl: event.url,
                    imageUrl: event.image,
                    type: "event",
                    category: "Community",
                    eventDate: new Date(Date.now() + 86400000 * 7), 
                    location: event.location || "Online",
                    isOnline: (event.location || "").toLowerCase().includes("online"),
                    registerUrl: event.url,
                    platform: "meetup",
                    aiInsights: aiData.insights,
                    status: "active",
                    targetAudience: "all"
                };

                let doc;
                if (existing) {
                    doc = await MarketIntelligence.findByIdAndUpdate(existing._id, { $set: eventData }, { new: true });
                    stats.updated++;
                } else {
                    doc = await MarketIntelligence.create(eventData);
                    stats.inserted++;
                }
                if (doc) results.push(doc);
            } catch (err) { 
                stats.failed++; 
            }
        }
        
        console.log(`[Meetup] ${keyword} Result: Success | Fetched: ${stats.fetched} | Inserted: ${stats.inserted} | Updated: ${stats.updated}`);

    } catch (error) {
        console.error(`[Meetup] ${keyword}: Master Failure | Error: ${error.message}`);
    } finally {
        await browser.close();
    }
    return results;
};

export const syncAllMeetupKeywords = async () => {
    const startTime = Date.now();
    console.log("[Meetup] Starting Sequential Keyword Sync...");
    
    // Switch to sequential to avoid resource starvation/timeouts
    const limitedKeywords = KEYWORDS.slice(0, 3);
    for(const kw of limitedKeywords) {
        await scrapeMeetupEvents(kw);
    }
    
    console.log(`[Meetup] Finished. Total Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
};
