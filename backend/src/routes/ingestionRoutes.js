import express from "express";
import { ingestionStats } from "../services/externalIngestionService.js";

const router = express.Router();

// STEP 9 — CREATE STATS API
router.get("/stats", (req, res) => {
    res.status(200).json({
        success: true,
        data: ingestionStats
    });
});

export default router;
