import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    uploadVDRDocument,
    getStartupVDR,
    requestVDRAccess,
    handleAccessRequest,
    getMyVDR
} from "../controllers/vdrController.js";

const router = express.Router();

router.use(protect);

router.post("/upload", uploadVDRDocument);
router.get("/my", getMyVDR);
router.get("/startup/:startupId", getStartupVDR);
router.post("/request/:documentId", requestVDRAccess);
router.put("/handle/:documentId/:requestId", handleAccessRequest);

export default router;
