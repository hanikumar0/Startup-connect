import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import User from "../models/User.js";

// Google Strategy
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
                    user = await User.findOne({ email: profile.emails[0].value });
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
                return done(error, null);
            }
        }
    )
);

// LinkedIn Strategy
passport.use(
    new LinkedInStrategy(
        {
            clientID: process.env.LINKEDIN_CLIENT_ID || "PASTE_YOUR_LINKEDIN_CLIENT_ID_HERE",
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "PASTE_YOUR_LINKEDIN_CLIENT_SECRET_HERE",
            callbackURL: "/api/auth/linkedin/callback",
            scope: ["r_emailaddress", "r_liteprofile"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await User.findOne({ linkedinId: profile.id });

                if (!user) {
                    user = await User.findOne({ email: profile.emails[0].value });
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
                return done(error, null);
            }
        }
    )
);

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
