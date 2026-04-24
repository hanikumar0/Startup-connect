import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { syncAllNews } from "../intelligence/news.scraper.js";
import { syncAllEvents } from "../intelligence/events.scraper.js";
import { syncAllGrants } from "../intelligence/grants.scraper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../../../", ".env") });

const testSync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Test Sync...");

        console.log("Testing News Sync...");
        await syncAllNews();

        console.log("Testing Events Sync...");
        await syncAllEvents();

        console.log("Testing Grants Sync...");
        await syncAllGrants();

        console.log("Test Sync Complete!");
        process.exit(0);
    } catch (error) {
        console.error("Test Sync Failed:", error);
        process.exit(1);
    }
};

testSync();
