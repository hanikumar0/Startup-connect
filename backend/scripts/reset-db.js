import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from root
dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI not found in .env");
  process.exit(1);
}

async function resetDB() {
  try {
    console.log("🛠️  Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: "startup_connect" });
    console.log("✅ Connected successfully.");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`🧹 Found ${collections.length} collections. Starting cleanup...`);

    for (const collection of collections) {
      console.log(`   - Dropping collection: ${collection.name}`);
      await db.collection(collection.name).drop();
    }

    console.log("\n✨ DATABASE RESET COMPLETE! ✨");
    console.log("Your MongoDB is now empty and ready for a fresh start.");
    
  } catch (error) {
    console.error("❌ ERROR resetting database:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetDB();
