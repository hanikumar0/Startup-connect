import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import Startup from "./src/models/Startup.js";

const startups = [
    {
        startupName: "TechFlow AI",
        industry: "SaaS",
        stage: "Seed",
        location: "San Francisco",
        description: "Intelligent workflow automation for enterprise sales teams.",
        fundingRequired: 1500000,
        isPublic: true,
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=TF"
    },
    {
        startupName: "GreenGrid",
        industry: "Cleantech",
        stage: "Series A",
        location: "Berlin",
        description: "Decentralized energy management for smart cities.",
        fundingRequired: 5000000,
        isPublic: true,
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=GG"
    },
    {
        startupName: "FinSwift",
        industry: "Fintech",
        stage: "MVP",
        location: "London",
        description: "Cross-border payments for emerging markets with zero fees.",
        fundingRequired: 500000,
        isPublic: true,
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=FS"
    },
    {
        startupName: "MediLink",
        industry: "Healthtech",
        stage: "Revenue",
        location: "Boston",
        description: "Telemedicine platform connecting rural areas to specialists.",
        fundingRequired: 2000000,
        isPublic: true,
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=ML"
    },
    {
        startupName: "Curo",
        industry: "AI/ML",
        stage: "Seed",
        location: "Austin",
        description: "AI-driven customer retention for e-commerce brands.",
        fundingRequired: 1200000,
        isPublic: true,
        logo: "https://api.dicebear.com/7.x/initials/svg?seed=CU"
    }
];

const seedStartups = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        console.log("Connected to MongoDB for Startup Seeding (startup_connect)");

        for (const s of startups) {
            await Startup.findOneAndUpdate(
                { startupName: s.startupName },
                s,
                { upsert: true, new: true }
            );
        }

        console.log("Seed complete: 5 startups injected.");
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedStartups();
