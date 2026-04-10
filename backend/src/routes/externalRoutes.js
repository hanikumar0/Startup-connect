import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { discoverExternal } from "../controllers/discoverController.js";

const router = express.Router();

router.use(protect);

// The user requested /api/external/discovery specifically
router.get("/discovery", discoverExternal);

export default router;
