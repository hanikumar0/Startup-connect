import express from "express";
import { 
    getMatchesForStartup, 
    getMatchesForInvestor, 
    getMyMatches 
} from "../controllers/matchController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMyMatches);
router.get("/investors/:startupId", getMatchesForStartup);
router.get("/startups/:investorId", getMatchesForInvestor);

export default router;
