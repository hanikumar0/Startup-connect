import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import logger from "./config/logger.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import roleTestRoutes from "./routes/roleTestRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import vdrRoutes from "./routes/vdrRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import pitchRoutes from "./routes/pitchRoutes.js";
import passport from "./config/passport.js";
import mongoose from "mongoose";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// ──────────────────────────────────────────
// 0. Trust Proxy (required for rate limiting behind reverse proxies like Render/Railway)
// ──────────────────────────────────────────
if (isProduction) {
  app.set("trust proxy", 1);
}

// ──────────────────────────────────────────
// 1. CORS — whitelist origins in production
// ──────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, health checks)
    if (!origin) return callback(null, true);

    if (!isProduction) {
      return callback(null, true); // Allow all in development
    }

    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }

    logger.warn({ origin }, "CORS blocked request from unauthorized origin");
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "bypass-tunnel-reminder"],
  credentials: true
}));

// ──────────────────────────────────────────
// 2. Session
// ──────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "startup_connect_secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    sameSite: isProduction ? "none" : "lax"
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ──────────────────────────────────────────
// 3. Security Headers
// ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ──────────────────────────────────────────
// 4. Rate Limiting
// ──────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isProduction ? 100 : 500,
  message: { message: "Too many requests, please try again later.", success: false },
  standardHeaders: true,
  legacyHeaders: false,
  // Use a key generator that works behind proxies
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 20 : 100,
  message: { message: "Too many auth attempts, please try again later.", success: false },
  keyGenerator: (req) => req.ip || req.headers["x-forwarded-for"] || "unknown",
});

app.use("/api", apiLimiter);

// ──────────────────────────────────────────
// 5. Body Parsing & Protection
// ──────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(hpp());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// ──────────────────────────────────────────
// 5.5. Request Logging Middleware
// ──────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, "Request failed");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "Client error");
    } else if (duration > 3000) {
      logger.warn(logData, "Slow request detected");
    }
    // Only log individual requests in development for non-health endpoints
    else if (!isProduction && !req.originalUrl.includes("/health")) {
      logger.debug(logData, "Request completed");
    }
  });
  next();
});

// ──────────────────────────────────────────
// 6. Health Check (before auth routes)
// ──────────────────────────────────────────
app.get("/health", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  let redisStatus = "unknown";
  try {
    const redis = await import("./config/redis.js");
    redisStatus = redis.default.status?.() || "unknown";
  } catch {
    redisStatus = "unavailable";
  }

  const status = mongoStatus === "connected" ? "healthy" : "degraded";

  res.status(status === "healthy" ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: mongoStatus,
      redis: redisStatus,
    },
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.get("/", (req, res) => {
  res.send("🚀 Startup Connect API is running");
});

// ──────────────────────────────────────────
// 7. Routes
// ──────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleTestRoutes);
app.use("/api/verify", verificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/docs", documentRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vdr", vdrRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/pitch", pitchRoutes);

// ──────────────────────────────────────────
// 8. 404 Handler
// ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ──────────────────────────────────────────
// 9. Global Error Handler
// ──────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error({
    err: { message: err.message, stack: isProduction ? undefined : err.stack },
    method: req.method,
    url: req.originalUrl,
  }, "Unhandled error");

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ success: false, message: "CORS: Origin not allowed" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)?.[0] || "field";
    return res.status(409).json({ success: false, message: `Duplicate value for ${field}` });
  }

  // SyntaxError from bad JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON in request body" });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message,
  });
});

export default app;
