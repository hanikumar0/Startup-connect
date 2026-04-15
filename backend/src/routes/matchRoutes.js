import express from "express";
import { 
    getMatchesForStartup, 
    getMatchesForInvestor, 
    getMyMatches,
    getSmartMatchesForUser,
    getAIMatchesForUser,
    logInteraction
} from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMyMatches);
router.get("/smart", getSmartMatchesForUser);
router.get("/ai", getAIMatchesForUser);
router.post("/track", logInteraction);
router.get("/investors/:startupId", getMatchesForStartup);
router.get("/startups/:investorId", getMatchesForInvestor);

export default router;
