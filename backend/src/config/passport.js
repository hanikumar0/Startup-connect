import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

// ─── Google Strategy ───
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: `${process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        user = await User.findOne({ email: profile.emails?.[0]?.value });
                        if (user) {
                            user.googleId = profile.id;
                            await user.save();
                        } else {
                            user = await User.create({
                                name: profile.displayName,
                                email: profile.emails[0].value,
                                googleId: profile.id,
                                isEmailVerified: true,
                            });
                        }
                    }
                    return done(null, user);
                } catch (error) {
                    console.error("Google Auth Error:", error.message);
                    return done(error, null);
                }
            }
        )
    );
    console.log("✅ Google OAuth strategy configured");
} else {
    console.warn("⚠️ Google OAuth not configured — GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
}

// ─── LinkedIn Strategy ───
// Only initialize if real credentials are provided
if (
    process.env.LINKEDIN_CLIENT_ID &&
    process.env.LINKEDIN_CLIENT_SECRET &&
    !process.env.LINKEDIN_CLIENT_ID.startsWith("your_")
) {
    // Dynamic import to avoid crash if passport-linkedin-oauth2 has issues
    try {
        const { Strategy: LinkedInStrategy } = await import("passport-linkedin-oauth2");
        passport.use(
            new LinkedInStrategy(
                {
                    clientID: process.env.LINKEDIN_CLIENT_ID,
                    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
                    callbackURL: `${process.env.PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/linkedin/callback`,
                    scope: ["r_emailaddress", "r_liteprofile"],
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        let user = await User.findOne({ linkedinId: profile.id });

                        if (!user) {
                            user = await User.findOne({ email: profile.emails?.[0]?.value });
                            if (user) {
                                user.linkedinId = profile.id;
                                await user.save();
                            } else {
                                user = await User.create({
                                    name: profile.displayName,
                                    email: profile.emails[0].value,
                                    linkedinId: profile.id,
                                    isEmailVerified: true,
                                });
                            }
                        }
                        return done(null, user);
                    } catch (error) {
                        console.error("LinkedIn Auth Error:", error.message);
                        return done(error, null);
                    }
                }
            )
        );
        console.log("✅ LinkedIn OAuth strategy configured");
    } catch (err) {
        console.warn("⚠️ LinkedIn OAuth strategy failed to load:", err.message);
    }
} else {
    console.warn("⚠️ LinkedIn OAuth not configured — credentials missing or placeholder");
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
