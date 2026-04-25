import express from "express";
import {
    requestVerification,
    getVerificationStatus,
    getBadgeMetadata,
    updateAlertPreferences,
    getAlertPreferences,
    adminApproveVerification,
    adminRejectVerification,
    adminRevokeBadge,
    adminListVerificationRequests,
} from "../controllers/badgeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/meta", getBadgeMetadata);

// Authenticated
router.use(protect);
router.post("/request", requestVerification);
router.get("/status", getVerificationStatus);
router.get("/preferences", getAlertPreferences);
router.put("/preferences", updateAlertPreferences);

// Admin only
router.get("/admin/requests", authorizeRoles("superadmin", "moderator"), adminListVerificationRequests);
router.put("/admin/approve/:requestId", authorizeRoles("superadmin", "moderator"), adminApproveVerification);
router.put("/admin/reject/:requestId", authorizeRoles("superadmin", "moderator"), adminRejectVerification);
router.post("/admin/revoke", authorizeRoles("superadmin"), adminRevokeBadge);

export default router;
