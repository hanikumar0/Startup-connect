import { chromium } from "playwright";
import MarketIntelligence from "../models/MarketIntelligence.js";
import { summarizeArticle } from "../intelligence/summary.ai.js";

/**
 * Unified Startup India Scraper using Playwright
 * Targets: Programs, Schemes, Challenges, Events
 */
export const scrapeStartupIndia = async () => {
    console.log("[Startup India] Browser Started");
    const startTime = Date.now();
    const browser = await chromium.launch({ headless: true });
    
    let stats = { fetched: 0, inserted: 0, updated: 0, failed: 0 };
    
    try {
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 },
            extraHTTPHeaders: { 'Accept-Language': 'en-IN,en;q=0.9' }
        });
        const page = await context.newPage();

        const targets = [
            { url: "https://www.startupindia.gov.in/content/sih/en/resources/programs.html", type: "event", cat: "Program" },
            { url: "https://www.startupindia.gov.in/content/sih/en/resources/government-schemes.html", type: "grant", cat: "Government" },
            { url: "https://www.startupindia.gov.in/content/sih/en/ams-application/challenge.html", type: "event", cat: "Challenge" },
            { url: "https://www.startupindia.gov.in/content/sih/en/search.html?type=event", type: "event", cat: "Networking" }
        ];

        for (const target of targets) {
            try {
                console.log(`[Startup India] Loading: ${target.url}`);
                await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60000 });
                await page.waitForTimeout(5000); // Buffer for JS content

                // Scroll to trigger lazy loading
                await page.evaluate(async () => {
                    for(let i=0; i<3; i++) {
                        window.scrollBy(0, 1000);
                        await new Promise(r => setTimeout(r, 800));
                    }
                });
                console.log(`[Startup India] Scroll Completed for ${target.cat}`);

                const items = await page.evaluate((type) => {
                    const cards = Array.from(document.querySelectorAll('.card, article, .program-card, .challenge-card, .common-card, .event-card'));
                    
                    let data = cards.map(card => {
                        const titleEl = card.querySelector('h2, h3, h4, .title, .name');
                        const linkEl = card.querySelector('a');
                        const descEl = card.querySelector('p, .description, .short-desc');
                        const dateEl = card.querySelector('.date, .expiry, .timeline');
                        
                        return {
                            title: titleEl?.innerText?.trim(),
                            url: linkEl?.href,
                            description: descEl?.innerText?.trim(),
                            dateText: dateEl?.innerText?.trim(),
                            type: type
                        };
                    });

                    // Fallback to all links if no cards
                    if (data.length < 3) {
                        const links = Array.from(document.querySelectorAll('a[href*="/program/"], a[href*="/challenge/"], a[href*="/scheme/"]'));
                        const fallbackData = links.map(a => ({
                            title: a.innerText?.split('\n')[0]?.trim() || "Startup India Record",
                            url: a.href,
                            description: "",
                            type: type
                        }));
                        data = [...data, ...fallbackData];
                    }

                    return data.filter(i => i.title && i.url && i.url.startsWith('http'));
                }, target.type);

                console.log(`[Startup India] Found ${items.length} raw links for ${target.cat}`);

                // Process items
                for (const item of items.slice(0, 10)) { // Limit per section
                    try {
                        const normalizedUrl = item.url.split('?')[0];
                        const existing = await MarketIntelligence.findOne({ sourceUrl: normalizedUrl });
                        
                        // Smart relevance filter
                        const text = (item.title + " " + item.description).toLowerCase();
                        const keywords = ["startup", "grant", "scheme", "challenge", "innovation", "program", "event", "workshop", "webinar", "incubator", "accelerator"];
                        if (!keywords.some(k => text.includes(k))) continue;

                        const aiData = await summarizeArticle(item.title, item.description || item.title);
                        
                        const recordData = {
                            title: item.title,
                            summary: aiData.summary || "Summary unavailable",
                            source: "Startup India",
                            sourceUrl: normalizedUrl,
                            type: target.type,
                            category: target.cat,
                            eventDate: item.dateText ? new Date(item.dateText) : new Date(Date.now() + 604800000), // Default 1 week
                            location: "India",
                            isOnline: true,
                            registerUrl: normalizedUrl,
                            aiInsights: aiData.insights,
                            status: "active",
                            platform: "startupindia"
                        };

                        if (existing) {
                            await MarketIntelligence.findByIdAndUpdate(existing._id, { $set: recordData });
                            stats.updated++;
                        } else {
                            await MarketIntelligence.create(recordData);
                            stats.inserted++;
                        }
                    } catch (err) { stats.failed++; }
                }
                stats.fetched += items.length;

            } catch (err) {
                console.error(`[Startup India] Target Failed: ${target.url} | ${err.message}`);
            }
        }

    } catch (error) {
        console.error(`[Startup India] Master Failure: ${error.message}`);
    } finally {
        await browser.close();
        console.log(`[Startup India] Completed Successfully | Fetched: ${stats.fetched} | Inserted: ${stats.inserted} | Updated: ${stats.updated}`);
    }
};
