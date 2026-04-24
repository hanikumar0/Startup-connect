import express from "express";
import { 
    discoverStartups, 
    discoverInvestors, 
    discoverExternal, 
    getRegisteredUsers,
    globalSearch, 
    getDiscoveryStats,
    searchInternal,
    searchGlobal 
} from "../controllers/discoverController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getDiscoveryStats);

router.get("/startups", discoverStartups);
router.get("/investors", discoverInvestors);
router.get("/external", discoverExternal);
router.get("/registered", getRegisteredUsers);

// Federated sub-routes (redirected to discoverExternal with source filtering)
router.get("/scraper/investors", (req, res) => { req.query.type = "investor"; req.query.source = "Scraper"; discoverExternal(req, res); });
router.get("/scraper/startups", (req, res) => { req.query.type = "startup"; req.query.source = "Scraper"; discoverExternal(req, res); });
router.get("/external/investors", (req, res) => { req.query.type = "investor"; req.query.source = "API"; discoverExternal(req, res); });
router.get("/external/startups", (req, res) => { req.query.type = "startup"; req.query.source = "API"; discoverExternal(req, res); });
router.get("/upload/leads", (req, res) => { req.query.source = "CSV"; discoverExternal(req, res); });
router.get("/uploaded/external", (req, res) => { req.query.source = "Uploaded"; discoverExternal(req, res); });

router.get("/search", globalSearch);
router.get("/search/internal", searchInternal);
router.get("/search/global", searchGlobal);

export default router;
