import express from "express";
import session from "express-session";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
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

const app = express();

// 1. CORS should be first to handle preflights correctly
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins in development to support tunnels and local testing
    callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "bypass-tunnel-reminder"],
  credentials: true
}));

app.use(session({
  secret: process.env.JWT_SECRET || "startup_connect_secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// 2. Set security HTTP headers (relaxed for development)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 3. Relaxed rate limit for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // 500 requests per minute
  message: { message: "Too many requests, please try again later.", success: false },
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(hpp());


app.use("/api/auth", authRoutes);
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


app.get("/", (req, res) => {
  res.send("🚀 Startup Connect API is running");
});

export default app;
