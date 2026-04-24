
import express from "express";
import { 
    requestWarmIntro, 
    getAvailablePaths, 
    respondToIntro, 
    getMyIntros 
} from "../controllers/introController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request", protect, requestWarmIntro);
router.post("/respond", protect, respondToIntro);
router.get("/available/:investorId", protect, getAvailablePaths);
router.get("/my-requests", protect, getMyIntros);

export default router;
