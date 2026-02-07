import express from "express";
import {
    getDashboardStats,
    getAllUsers,
    verifyUserManual,
    getVerificationQueue
} from "../controllers/adminController.js";
import { protect, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply protection and admin authorization to all routes
router.use(protect);
router.use(authorizeAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/verification-queue", getVerificationQueue);
router.patch("/verify/:userId", verifyUserManual);

export default router;
