import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  googleAuth,
  linkedinAuth,
  getUserProfile,
  updateUserProfile,
  checkAuthSession,
  getPublicProfile,
  sendOTP,
  registerVerify
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validations/authValidation.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-otp", sendOTP);
router.post("/register-verify", registerVerify);
router.get("/me", protect, getMe);
router.get("/profile", protect, getUserProfile);

// Google Auth
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email", "https://www.googleapis.com/auth/calendar.events"],
  accessType: "offline",
  prompt: "consent"
}));
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${token}&user=${JSON.stringify(req.user)}`);
  }
);

// LinkedIn Auth
router.get("/linkedin", passport.authenticate("linkedin"));
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${token}&user=${JSON.stringify(req.user)}`);
  }
);

// Optional POST routes for token exchange if using client-side SDKs
router.post("/google", googleAuth);
router.post("/linkedin", linkedinAuth);

export default router;
