import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    uploadVDRDocument,
    getStartupVDR,
    requestVDRAccess,
    handleAccessRequest,
    getMyVDR,
    getVDRRoomByMatch,
    getVDRMessages,
    sendVDRMessage,
    uploadVDRFile,
    getVDRFiles,
    updateVDRFileMetadata,
    saveVDRDataField,
    getVDRDataFields,
    updateVDRDataField
} from "../controllers/vdrController.js";

const router = express.Router();

router.use(protect);

router.post("/upload", uploadVDRDocument);
router.get("/my", getMyVDR);
router.get("/startup/:startupId", getStartupVDR);
router.post("/request/:documentId", requestVDRAccess);
router.put("/handle/:documentId/:requestId", handleAccessRequest);

// --- Match-based VDR Routes ---
router.get("/room/:matchId", getVDRRoomByMatch);
router.get("/messages/:roomId", getVDRMessages);
router.post("/message", sendVDRMessage);
router.post("/upload-vdr", uploadVDRFile); // Using /upload-vdr to avoid clash
router.get("/documents/:roomId", getVDRFiles);
router.patch("/document/:id", updateVDRFileMetadata);

// --- Structured Data Routes ---
router.post("/data", saveVDRDataField);
router.get("/data/:roomId", getVDRDataFields);
router.patch("/data/:id", updateVDRDataField);

export default router;
