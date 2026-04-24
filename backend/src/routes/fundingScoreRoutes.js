
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
    recalculateScore, 
    getMyScore, 
    getStartupScore 
} from "../controllers/fundingScoreController.js";

const router = express.Router();

router.use(protect);

router.post("/calculate", recalculateScore);
router.get("/me", getMyScore);
router.get("/:startupId", getStartupScore);

export default router;
