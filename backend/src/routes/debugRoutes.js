import express from "express";
import { logRenderCount } from "../controllers/debugController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Allow authenticated users to report rendering metrics for observability
router.post("/render-count", protect, logRenderCount);

export default router;
