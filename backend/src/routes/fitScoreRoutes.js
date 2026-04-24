
import express from "express";
import { 
    calculatePairFitScore, 
    getStartupFitMatches, 
    getInvestorFitMatches,
    refreshMyFitScores
} from "../controllers/fitScoreController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/calculate", protect, calculatePairFitScore);
router.post("/refresh", protect, refreshMyFitScores);
router.get("/startup/:id", protect, getStartupFitMatches);
router.get("/investor/:id", protect, getInvestorFitMatches);

export default router;
