import express from "express";
import {
    getGrants,
    getRecommendedGrants,
    getClosingSoon,
    searchGrants,
    getGrantById,
    createGrant,
    updateGrant,
    deleteGrant,
    seedGrants,
} from "../controllers/grantController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.get("/", getGrants);
router.get("/search", searchGrants);
router.get("/closing-soon", getClosingSoon);
router.get("/:id", getGrantById);

// Authenticated
router.get("/recommended", protect, getRecommendedGrants);

// Admin only
router.post("/seed", protect, authorizeRoles("superadmin"), seedGrants);
router.post("/", protect, authorizeRoles("superadmin", "moderator"), createGrant);
router.put("/:id", protect, authorizeRoles("superadmin", "moderator"), updateGrant);
router.delete("/:id", protect, authorizeRoles("superadmin"), deleteGrant);

export default router;

