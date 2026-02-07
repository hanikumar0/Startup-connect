import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { analyzePitch } from "../controllers/pitchController.js";

const router = express.Router();

router.post("/analyze", protect, analyzePitch);

export default router;
