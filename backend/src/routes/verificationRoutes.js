import express from "express";
import { verifyAadhaar, verifyPAN, verifyBusiness, getDeepHistoryAudit } from "../controllers/verificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/aadhaar", verifyAadhaar);
router.post("/pan", verifyPAN);
router.post("/business", verifyBusiness);
router.post("/deep-audit", getDeepHistoryAudit);

export default router;
