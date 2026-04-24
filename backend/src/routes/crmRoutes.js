import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getCRMLeads,
    addLead,
    moveStage,
    addNote,
    addTask,
    getCRMAnalytics
} from "../controllers/crmController.js";

const router = express.Router();

router.get("/pipeline", protect, getCRMLeads);
router.post("/add", protect, addLead);
router.post("/move-stage", protect, moveStage);
router.post("/note", protect, addNote);
router.post("/task", protect, addTask);
router.get("/analytics", protect, getCRMAnalytics);

export default router;
