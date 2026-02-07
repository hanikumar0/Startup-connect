import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createStartupProfile,
    createInvestorProfile,
    getMyProfile,
    getDashboardStats,
    getDiscoverableProfiles,
    getNotifications,
    markNotificationRead,
    sendConnectionRequest,
    acceptConnectionRequest,
    submitVerification,
    updatePitchDeck,
    getMyConnections
} from "../controllers/userController.js";
import { getRecommendations } from "../controllers/recommendationController.js";

const router = express.Router();

router.get("/profile", protect, getMyProfile);
router.get("/stats", protect, getDashboardStats);
router.get("/discover", protect, getDiscoverableProfiles);
router.get("/notifications", protect, getNotifications);
router.put("/notifications/:id", protect, markNotificationRead);
router.post("/startup-profile", protect, createStartupProfile);
router.post("/investor-profile", protect, createInvestorProfile);
router.post("/verify", protect, submitVerification);
router.put("/pitch-deck", protect, updatePitchDeck);

// Connection routes
router.post("/connect", protect, sendConnectionRequest);
router.put("/connect/:connectionId", protect, acceptConnectionRequest);

router.get("/connections", protect, getMyConnections);
router.get("/recommendations/:profileId", protect, getRecommendations);

export default router;
