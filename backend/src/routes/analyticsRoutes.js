import express from "express";
import { getStartupAnalytics, getInvestorAnalytics } from "../controllers/analyticsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/startup", authorizeRoles('startup', 'superadmin'), getStartupAnalytics);
router.get("/investor", authorizeRoles('investor', 'superadmin'), getInvestorAnalytics);

export default router;
