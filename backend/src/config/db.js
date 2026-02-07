import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "startup_connect",
      tls: true,
      serverSelectionTimeoutMS: 10000,
      family: 4, // Force IPv4
    });

    // Disable buffering if we lose connection
    mongoose.set('bufferCommands', false);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      console.error("❌ MongoDB DNS Error: Could not resolve the connection string.");
      console.error("💡 Tip: Your network might be blocking SRV records. Try using the standard 'mongodb://' format instead of 'mongodb+srv://' or check your internet connection.");
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error("❌ SSL/TLS Connection Error detected.");
      console.error("💡 Tip: Check if your IP is whitelisted in MongoDB Atlas.");
    }
    console.error("❌ MongoDB connection failed:", error.message);
  }
};

export default connectDB;
