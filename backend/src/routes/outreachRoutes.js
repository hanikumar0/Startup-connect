import express from "express";
import multer from "multer";
import {
  importLeads,
  getLeads,
  updateLeadStatus,
  createCampaign,
  sendCampaign,
  getCampaigns,
  getCampaignById,
  generateLinkedInMessage,
  getOutreachAnalytics
} from "../controllers/outreachController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Memory storage for CSV buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Admin-only outreach endpoints
router.use(protect);
router.use(authorizeRoles("admin"));

// Leads
router.get("/leads", getLeads);
router.post("/leads/import", upload.single("file"), importLeads);
router.patch("/leads/:id/status", updateLeadStatus);

// Campaigns
router.get("/campaign", getCampaigns);
router.get("/campaign/:id", getCampaignById);
router.post("/campaign/create", createCampaign);
router.post("/campaign/send", sendCampaign);

// AI & Analytics
router.post("/outreach/linkedin-message", generateLinkedInMessage);
router.get("/outreach/analytics", getOutreachAnalytics);

export default router;
