
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

import ExternalProfile from "../src/models/ExternalProfile.js";

async function auditData() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) throw new Error("Missing MONGO_URI/MONGODB_URI in .env");
        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        const total = await ExternalProfile.countDocuments({});
        const startups = await ExternalProfile.countDocuments({ type: "startup" });
        const investors = await ExternalProfile.countDocuments({ type: "investor" });
        const noType = await ExternalProfile.countDocuments({ type: { $exists: false } });
        const otherType = await ExternalProfile.countDocuments({ type: { $nin: ["startup", "investor"] } });

        console.log("\n================================");
        console.log("DB DATA AUDIT");
        console.log("================================");
        console.log(`Total Records:    ${total}`);
        console.log(`Type 'startup':   ${startups}`);
        console.log(`Type 'investor':  ${investors}`);
        console.log(`Missing Type:     ${noType}`);
        console.log(`Invalid Type:     ${otherType}`);
        console.log("================================\n");

        if (total > 0 && startups === 0 && investors === 0) {
            console.log("⚠️ WARNING: Records exist but have invalid types!");
            const sample = await ExternalProfile.findOne({});
            console.log("Sample Record:", JSON.stringify(sample, null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error("Audit failed:", error);
        process.exit(1);
    }
}

auditData();
