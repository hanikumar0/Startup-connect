import mongoose from "mongoose";
import dotenv from "dotenv";
import { runMasterIngestion } from "../src/services/externalIngestionService.js";

dotenv.config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        console.log("Connected to MongoDB for Strategic Ingestion (startup_connect)...");
        await runMasterIngestion();
        console.log("Ingestion Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Fatal Ingestion Error:", err);
        process.exit(1);
    }
}

run();
