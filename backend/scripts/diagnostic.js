import mongoose from "mongoose";
import dotenv from "dotenv";
import ExternalStartup from "../src/models/ExternalStartup.js";
import ExternalInvestor from "../src/models/ExternalInvestor.js";

dotenv.config({ path: ".env" });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        console.log("Checked Database: startup_connect");
        
        const startups = await ExternalStartup.countDocuments();
        const investors = await ExternalInvestor.countDocuments();
        
        console.log("Startups Count:", startups);
        console.log("Investors Count:", investors);
        
        if (startups > 0) {
            const oneStartup = await ExternalStartup.findOne();
            console.log("Sample Startup:", JSON.stringify(oneStartup, null, 2));
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
