import axios from "axios";
import * as cheerio from "cheerio";
import Investor from "../models/Investor.js";
import enrichmentService from "../services/enrichmentService.js";

/**
 * Investor Website Scraper
 */
export const scrapeInvestorWebsite = async (investorId) => {
    try {
        const investor = await Investor.findById(investorId);
        if (!investor || !investor.website) return { success: false, error: "Investor or website not found" };

        const response = await axios.get(investor.website);
        const $ = cheerio.load(response.data);

        // Try to find portfolio companies
        const portfolio = [];
        $('a').each((i, el) => {
            const text = $(el).text().trim();
            const href = $(el).attr('href');
            if (href && (href.includes('/portfolio') || text.toLowerCase().includes('portfolio'))) {
                // This is a link to the portfolio page, maybe we depth scrape?
                // For now, let's just extract some text that looks like companies
            }
        });

        // Simple heuristic for thesis/description
        const metaDescription = $('meta[name="description"]').attr('content');
        const thesis = $('h1, h2, p').text().substring(0, 500); // Very basic extraction

        await Investor.findByIdAndUpdate(investorId, {
            $set: {
                investmentThesis: metaDescription || thesis,
                lastUpdated: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error(`Website Scrape Error for ${investorId}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Run for all investors from a specific source
 */
export const runWebsiteScraperBatch = async (source = "openvc") => {
    const investors = await Investor.find({ source });
    let successCount = 0;

    for (const inv of investors) {
        const res = await scrapeInvestorWebsite(inv._id);
        if (res.success) successCount++;
    }

    return { success: true, processed: investors.length, updated: successCount };
};
