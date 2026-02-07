import express from "express";
import { getMatchesForStartup, getMatchesForInvestor, analyzePitch } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/startup", getMatchesForStartup);
router.get("/investor", getMatchesForInvestor);
router.post("/analyze", analyzePitch);

export default router;
