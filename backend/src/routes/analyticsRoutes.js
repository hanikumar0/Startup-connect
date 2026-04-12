import express from "express";
import { getStartupAnalytics, getInvestorAnalytics, trackUiCount } from "../controllers/analyticsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/startup", authorizeRoles('startup', 'superadmin'), getStartupAnalytics);
router.get("/investor", authorizeRoles('investor', 'superadmin'), getInvestorAnalytics);
router.post("/ui-count", trackUiCount);

export default router;
