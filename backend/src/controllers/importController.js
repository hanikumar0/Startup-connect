import { importFromProductHunt } from "../scrapers/producthunt.js";
import { importFromGitHub } from "../scrapers/github.js";
import { importFromHackerNews } from "../scrapers/hackernews.js";
import { importFromOpenVC } from "../scrapers/openvc.js";
import { importFromApify } from "../scrapers/apify.js";
import { runWebsiteScraperBatch } from "../scrapers/investorWebsite.js";
import enrichmentService from "../services/enrichmentService.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";

/**
 * Import Controller
 */
class ImportController {
    async importProductHunt(req, res) {
        const result = await importFromProductHunt();
        res.status(result.success ? 200 : 500).json(result);
    }

    async importGitHub(req, res) {
        const result = await importFromGitHub();
        res.status(result.success ? 200 : 500).json(result);
    }

    async importHackerNews(req, res) {
        const result = await importFromHackerNews();
        res.status(result.success ? 200 : 500).json(result);
    }

    async importInvestorsOpenVC(req, res) {
        const result = await importFromOpenVC();
        res.status(result.success ? 200 : 500).json(result);
    }

    async importInvestorsApify(req, res) {
        const result = await importFromApify();
        res.status(result.success ? 200 : 500).json(result);
    }

    async importInvestorsWebsites(req, res) {
        const result = await runWebsiteScraperBatch();
        res.json(result);
    }

    async enrichData(req, res) {
        const startups = await Startup.find({ logo: { $exists: false } }).limit(50);
        const investors = await Investor.find({ logo: { $exists: false } }).limit(50);
        
        let enrichedCount = 0;
        
        for (const s of startups) {
            const enriched = await enrichmentService.enrichRecord(s, 'startup');
            await Startup.findByIdAndUpdate(s._id, enriched);
            enrichedCount++;
        }
        
        for (const i of investors) {
            const enriched = await enrichmentService.enrichRecord(i, 'investor');
            await Investor.findByIdAndUpdate(i._id, enriched);
            enrichedCount++;
        }
        
        res.json({ success: true, enriched: enrichedCount });
    }

    async runAll(req, res) {
        // Run everything sequentially for a full sync
        const results = {
            producthunt: await importFromProductHunt(),
            github: await importFromGitHub(),
            hackernews: await importFromHackerNews(),
            openvc: await importFromOpenVC(),
            apify: await importFromApify()
        };
        res.json({ success: true, results });
    }
}

export default new ImportController();
