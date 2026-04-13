import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNetworkData } from "../controllers/networkController.js";

const router = express.Router();

// STRICT: All network discovery routes are protected
router.use(protect);

router.get("/", getNetworkData);

export default router;
