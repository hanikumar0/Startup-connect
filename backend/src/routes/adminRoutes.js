import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    updateUserStatus,
    handleUserDelete,
    verifyUserManual,
    getStartups,
    moderateStartup,
    getInvestors,
    moderateInvestor,
    getClaims,
    getScraperLogs,
    triggerScraper,
    scrapeUrl,
    getSubscriptions,
    getReports,
    resolveReport
} from "../controllers/adminController.js";
import { protect, authorizeAdmin, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection and admin authorization to all routes
router.use(protect);
router.use(authorizeAdmin);

// Dashboard & Analytics
router.get("/stats", getDashboardStats);

// User Management
router.get("/users", getAllUsers);
router.put("/user/:id/status", authorizeRoles('superadmin', 'moderator'), updateUserStatus);
router.put("/user/:id/verify", authorizeRoles('superadmin', 'moderator', 'support'), verifyUserManual);
router.delete("/user/:id", authorizeRoles('superadmin'), handleUserDelete);

// Startup Moderation
router.get("/startups", getStartups);
router.put("/startup/:id/status", moderateStartup);

// Investor Moderation
router.get("/investors", getInvestors);
router.put("/investor/:id/status", moderateInvestor);

// Claims & Verification
router.get("/claims", getClaims);

// Scraper Management
router.get("/scrape/logs", getScraperLogs);
router.post("/scrape/:type", triggerScraper);
router.post("/scrape/url", scrapeUrl);

// Subscription Management
router.get("/subscriptions", getSubscriptions);

// Platform Governance
router.get("/reports", getReports);
router.put("/report/:id/resolve", resolveReport);

export default router;
