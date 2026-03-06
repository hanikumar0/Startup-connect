import "./config/env.js";
import { validateEnvironment } from "./config/validate-env.js";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import setupSockets from "./sockets/index.js";
import logger from "./config/logger.js";

// Validate environment before anything else
validateEnvironment();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Connect Database and Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Setup WebSockets
    setupSockets(server);

    server.on("error", (e) => {
      if (e.code === "EADDRINUSE") {
        logger.error(`❌ Port ${PORT} is currently in use. Existing process must be cleared.`);
        process.exit(1); // Exit so nodemon can rerun the predev cleanup
      } else {
        logger.error({ err: e }, "❌ Server encountered an error on start");
        process.exit(1);
      }
    });

    server.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });
  } catch (error) {
    logger.error({ err: error }, "❌ Unexpected server crash during initialization");
    process.exit(1);
  }
};

// ──────────────────────────────────────────
// Graceful Shutdown
// ──────────────────────────────────────────
const gracefulShutdown = (signal) => {
  logger.warn(`⚠️ ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info("🔌 HTTP server closed");
    try {
      const mongoose = await import("mongoose");
      await mongoose.default.connection.close(false);
      logger.info("🗃️ MongoDB connection closed");
    } catch (err) {
      logger.error({ err }, "Error during DB disconnect");
    }

    // Close Redis gracefully
    try {
      const redis = await import("./config/redis.js");
      if (redis.default?.quit) {
        await redis.default.quit();
        logger.info("🔴 Redis connection closed");
      }
    } catch (err) {
      // Redis may not be available
    }

    process.exit(0);
  });

  // Force exit after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error("❌ Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Catch unhandled errors to prevent silent crashes
process.on("unhandledRejection", (reason, promise) => {
  logger.error({ reason }, "❌ Unhandled Rejection");
});

process.on("uncaughtException", (error) => {
  logger.error({ err: error }, "❌ Uncaught Exception");
  gracefulShutdown("uncaughtException");
});

startServer();
