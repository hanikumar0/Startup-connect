import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "startup_connect" });
    const db = mongoose.connection.db;
    const users = await db.collection("users").countDocuments();
    console.log(`🔍 Found ${users} users in collection 'users'.`);
    
    // Check all collections
    const collections = await db.listCollections().toArray();
    console.log(`📚 All collections: ${collections.map(c => c.name).join(", ")}`);
    
  } catch (error) {
    console.error("❌ ERROR checking database:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkUsers();
