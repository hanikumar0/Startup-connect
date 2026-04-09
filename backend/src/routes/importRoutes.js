import express from "express";
import importController from "../controllers/importController.js";
import { protect, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Publicly triggerable during development, but should be protected by admin in production
router.post("/producthunt", importController.importProductHunt);
router.post("/github", importController.importGitHub);
router.post("/hackernews", importController.importHackerNews);
router.post("/investors/openvc", importController.importInvestorsOpenVC);
router.post("/investors/apify", importController.importInvestorsApify);
router.post("/investors/websites", importController.importInvestorsWebsites);
router.post("/enrich", importController.enrichData);

// Admin-only runs
router.post("/run-all", protect, authorizeAdmin, importController.runAll);

export default router;
