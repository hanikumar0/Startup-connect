import express from "express";
import multer from "multer";
import { uploadPitchDeck, getPitchDeck } from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect);

router.post("/upload-pitch", upload.single("pitchDeck"), uploadPitchDeck);
router.get("/pitch/:startupId", getPitchDeck);

export default router;
