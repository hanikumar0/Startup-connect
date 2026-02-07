import "./config/env.js";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import setupSockets from "./sockets/index.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Connect Database and Start Server
const startServer = async () => {
  try {
    await connectDB();

    // Setup WebSockets
    setupSockets(server);

    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server due to DB connection issues:", error);
    process.exit(1);
  }
};

startServer();
