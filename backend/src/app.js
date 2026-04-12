import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import logger from "./config/logger.js";
import cron from "node-cron";
import { runMasterIngestion } from "./services/externalIngestionService.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import startupRoutes from "./routes/startupRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import discoverRoutes from "./routes/discoverRoutes.js";
import saveRoutes from "./routes/saveRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import claimRoutes from "./routes/claimRoutes.js";
import onboardingRoutes from "./routes/onboardingRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import roleTestRoutes from "./routes/roleTestRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import billingRoutes from "./routes/billingRoutes.js";
import vdrRoutes from "./routes/vdrRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import pitchRoutes from "./routes/pitchRoutes.js";
import outreachRoutes from "./routes/outreachRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import externalRoutes from "./routes/externalRoutes.js";
import ingestionRoutes from "./routes/ingestionRoutes.js";
import passport from "./config/passport.js";
import mongoose from "mongoose";
import AppError from "./utils/AppError.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Trust Proxy
if (isProduction) {
  app.set("trust proxy", 1);
}

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (!isProduction) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "bypass-tunnel-reminder"],
  credentials: true
}));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || "startup_connect_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: isProduction ? "none" : "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Security
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests, please try again later.", success: false },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many auth attempts, please try again later.", success: false },
});

app.use("/api", apiLimiter);

// Body Parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(hpp());
app.use(mongoSanitize());
app.use(xss());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/startup", startupRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/save", saveRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/claim", claimRoutes);
app.use("/api/users", userRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/docs", documentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/vdr", vdrRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/pitch", pitchRoutes);
app.use("/api/outreach", outreachRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/import", importRoutes);
app.use("/api/external", externalRoutes);
app.use("/api/ingestion", ingestionRoutes);

// Error Handling
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this institutional gateway!`, 404));
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Production: Minimal info
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        } else {
            // Programming or other unknown error: don't leak error details
            logger.error({ err }, "NON-OPERATIONAL ERROR DETECTED");
            res.status(500).json({
                success: false,
                message: "A strategic anomaly occurred. Calibrating recovery protocols..."
            });
        }
    }
});

// --- Strategic Data Ingestion Pipelines ---
// CRON_IMPORT = 0 */12 * * * (Every 12 hours)
cron.schedule("0 */12 * * *", () => {
    runMasterIngestion();
});

// Immediate Background Fetch on Startup for Initial Population
runMasterIngestion();

export default app;
