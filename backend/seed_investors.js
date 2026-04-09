import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import Investor from "./src/models/Investor.js";

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        console.log("Connected to MongoDB for Seeding (startup_connect)");

        // We clean out old "unclaimed" imported investors and keep only claimed ones,
        // or just add any new ones. Let's delete all purely unverified/unclaimed imports.
        // For safety, let's just insert them. If they exist by name, skip.

        let jsonData;
        try {
            const rawData = fs.readFileSync("C:/startup connect/.agent/scratch/investors_extracted.json", "utf8");
            jsonData = JSON.parse(rawData);
        } catch(e) {
            console.error("Could not read investors JSON file", e);
            process.exit(1);
        }

        const items = jsonData.startups_and_investors;
        console.log(`Read ${items.length} investors`);

        let insertedCount = 0;
        let skippedCount = 0;

        for (const item of items) {
            const { basic_info, investor_details } = item;
            
            // Check if investor exists by name
            const exists = await Investor.findOne({ investorName: basic_info.name });
            if (exists) {
                skippedCount++;
                continue;
            }

            // Cleanup strings
            const parseMoney = (str) => {
                const numeric = str.replace(/[^0-9]/g, "");
                return numeric ? parseInt(numeric, 10) : 0;
            };

            const bounds = (investor_details.ticket_size || "").split("-");
            let checkSizeMin = 0;
            let checkSizeMax = 0;
            if (bounds.length > 0) checkSizeMin = parseMoney(bounds[0]);
            if (bounds.length > 1) checkSizeMax = parseMoney(bounds[1]);

            // Transform thesis arrays
            let industries = investor_details.investment_focus?.industries || "";
            let splitIndustries = industries.split(",").map(i => i.trim()).filter(i=>i);

            await Investor.create({
                investorName: basic_info.name,
                firmName: investor_details.firm_name,
                investorType: ["Angel", "VC", "Micro VC", "Family Office", "Accelerator", "Incubator", "Corporate VC", "Syndicate", "Private Equity", "Venture Capital Investor"].includes(investor_details.investor_type) ? investor_details.investor_type : "VC",
                bio: (investor_details.investment_focus?.industries || "Strategic investor looking for forward-thinking startups.").substring(0, 500),
                website: basic_info.website,
                location: basic_info.location || "Global",
                checkSizeMin: checkSizeMin || 50000,
                checkSizeMax: checkSizeMax || 500000,
                preferredIndustries: splitIndustries.length > 0 ? splitIndustries : ["Technology"],
                investmentThesis: investor_details.investment_focus?.industries,
                source: "import_csv",
                isPublic: true,
                status: "approved", // auto approved for listings
                isClaimed: false
            });
            insertedCount++;
        }

        console.log(`Seeding complete. Inserted: ${insertedCount}. Skipped: ${skippedCount}.`);
        process.exit(0);

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();
