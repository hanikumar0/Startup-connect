import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "startup_connect",
      tls: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4,
      retryWrites: true,
      w: "majority"
    });

    // Disable buffering if we lose connection
    mongoose.set('bufferCommands', false);

    // Connection event handlers for production monitoring
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB runtime error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB disconnected. Attempting reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected successfully");
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Drop problematic legacy index if exists
    try {
        const meetingsCollection = conn.connection.collection('meetings');
        await meetingsCollection.dropIndex('roomId_1');
        console.log("🧹 Dropped defunct 'roomId_1' unique index from meetings collection.");
    } catch (e) {
        // If index doesn't exist, we don't care
    }

    return conn;
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error("❌ MongoDB DNS Error: Could not resolve the connection string.");
      console.error("💡 Tip: Your network might be blocking SRV records.");
    } else if (error.message?.includes('SSL') || error.message?.includes('TLS')) {
      console.error("❌ SSL/TLS Connection Error detected.");
      console.error("💡 Tip: Check if your IP is whitelisted in MongoDB Atlas.");
    }
    console.error("❌ MongoDB connection failed:", error.message);
    throw error; // Re-throw so server.js can handle it
  }
};

export default connectDB;
