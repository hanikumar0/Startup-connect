import express from "express";
import { getAiMatch, analyzePitchDeck, getAiRecommendations, improveText } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);

router.post("/match", getAiMatch);
router.post("/analyze-pitch", upload.single("file"), analyzePitchDeck);
router.post("/improve-text", improveText);
router.get("/recommendations", getAiRecommendations);

export default router;
