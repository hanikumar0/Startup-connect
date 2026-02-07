import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Startup only
router.get(
  "/startup",
  protect,
  authorizeRoles("startup"),
  (req, res) => {
    res.json({ message: "Startup dashboard access granted" });
  }
);

// Investor only
router.get(
  "/investor",
  protect,
  authorizeRoles("investor"),
  (req, res) => {
    res.json({ message: "Investor dashboard access granted" });
  }
);

// Admin only
router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Admin dashboard access granted" });
  }
);

export default router;
