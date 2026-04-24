import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getIntelligence,
    getPersonalizedIntelligence,
    getTrendingSectors,
    saveIntelligence,
    unsaveIntelligence,
    getSavedIntelligence,
    searchIntelligence,
    getIntelligenceCounts
} from "../controllers/intelligenceController.js";
import { syncAllNews } from "../intelligence/news.scraper.js";
import { syncAllEvents } from "../intelligence/events.scraper.js";
import { syncAllGrants } from "../intelligence/grants.scraper.js";
import { scrapeStartupIndia } from "../scrapers/startupindia.scraper.js";
import { scrapeMeetupEvents } from "../scrapers/meetup.scraper.js";

const router = express.Router();


router.get("/", protect, getIntelligence);
router.get("/search", protect, searchIntelligence);
router.get("/personalized", protect, getPersonalizedIntelligence);
router.get("/trending-sectors", protect, getTrendingSectors);
router.get("/counts", protect, getIntelligenceCounts);
router.get("/saved", protect, getSavedIntelligence);
router.post("/save", protect, saveIntelligence);
router.delete("/save/:itemId", protect, unsaveIntelligence);

// Admin Manual Sync
router.post("/sync", protect, async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        
        // Trigger in background
        syncAllNews();
        syncAllEvents();
        syncAllGrants();
        scrapeStartupIndia();
        
        res.status(200).json({ success: true, message: "Sync started in background" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin Manual Meetup Sync
router.post("/sync-meetup", protect, async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }
        
        const keyword = req.query.keyword || "startup";
        scrapeMeetupEvents(keyword);
        
        res.status(200).json({ success: true, message: `Meetup sync started for keyword: ${keyword}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


export default router;
