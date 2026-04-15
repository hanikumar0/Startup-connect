import express from "express";
import { submitKYC, getKYCStatus } from "../controllers/kycController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/status", getKYCStatus);
router.post("/submit", submitKYC);

export default router;
