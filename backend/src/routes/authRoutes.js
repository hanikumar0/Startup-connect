import express from "express";
import { register, login, sendOTP, verifyOTP } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Google Auth
router.get("/google", (req, res, next) => {
    const { redirect_uri } = req.query;
    const state = redirect_uri ? Buffer.from(JSON.stringify({ redirect_uri })).toString('base64') : undefined;
    passport.authenticate("google", { scope: ["profile", "email"], state })(req, res, next);
});

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const { state } = req.query;
        let redirectTarget = (process.env.FRONTEND_URL || "http://localhost:3000") + "/login";

        if (state) {
            try {
                const parsedState = JSON.parse(Buffer.from(state, "base64").toString());
                if (parsedState.redirect_uri) {
                    redirectTarget = parsedState.redirect_uri;
                }
            } catch (err) {
                console.error("Error parsing auth state:", err);
            }
        }

        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Only pass essential user info (not full document) to avoid URL length issues
        const safeUser = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isProfileCompleted: req.user.isProfileCompleted,
        }));

        const separator = redirectTarget.includes("?") ? "&" : "?";
        const finalUrl = `${redirectTarget}${separator}token=${token}&user=${safeUser}`;

        res.redirect(finalUrl);
    }
);

// LinkedIn Auth
router.get("/linkedin", passport.authenticate("linkedin"));
router.get(
    "/linkedin/callback",
    passport.authenticate("linkedin", { failureRedirect: "/login", session: false }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        const safeUser = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isProfileCompleted: req.user.isProfileCompleted,
        }));
        res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login?token=${token}&user=${safeUser}`);
    }
);

export default router;
