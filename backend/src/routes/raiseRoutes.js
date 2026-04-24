import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createRound,
    getMyRound,
    addCommitment,
    getRaiseAnalytics
} from "../controllers/raiseController.js";

const router = express.Router();

router.get("/me", protect, getMyRound);
router.post("/create", protect, createRound);
router.post("/commitment", protect, addCommitment);
router.get("/analytics", protect, getRaiseAnalytics);

export default router;
