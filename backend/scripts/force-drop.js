import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function forceDropUsers() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "startup_connect" });
    const db = mongoose.connection.db;
    
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`📦 Found collections: ${collectionNames.join(", ")}`);
    
    if (collectionNames.includes("users")) {
      console.log("🧹 Dropping 'users' collection specifically...");
      await db.collection("users").drop();
      console.log("✅ 'users' collection DROPPED.");
    } else {
      console.log("ℹ️ No 'users' collection found in 'startup_connect' database.");
    }

    if (collectionNames.includes("startups")) {
      console.log("🧹 Dropping 'startups' collection specifically...");
      await db.collection("startups").drop();
      console.log("✅ 'startups' collection DROPPED.");
    }

    if (collectionNames.includes("investors")) {
      console.log("🧹 Dropping 'investors' collection specifically...");
      await db.collection("investors").drop();
      console.log("✅ 'investors' collection DROPPED.");
    }

    console.log("\n🧹 Final cleanup complete.");
    
  } catch (error) {
    console.error("❌ ERROR during force drop:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

forceDropUsers();
