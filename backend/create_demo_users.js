import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

import User from "./src/models/User.js";
import Startup from "./src/models/Startup.js";
import Investor from "./src/models/Investor.js";

const DEMO_PASSWORD = "Password123!";

const demoUsers = [
    {
        name: "Founder Alex",
        email: "alex@startup.com",
        role: "startup",
        profile: {
            startupName: "Apex Robotics",
            description: "Next-generation humanoid robots for warehouse automation.",
            industry: "Robotics",
            stage: "revenue",
            location: "San Francisco, CA",
            tagline: "Robots that think like humans.",
            isPublic: true,
            status: "approved"
        }
    },
    {
        name: "Founder Sarah",
        email: "sarah@startup.com",
        role: "startup",
        profile: {
            startupName: "EcoClean",
            description: "Sustainable ocean cleaning technology using micro-grids.",
            industry: "Cleantech",
            stage: "MVP",
            location: "Berlin, Germany",
            tagline: "Saving the oceans, one grid at a time.",
            isPublic: true,
            status: "approved"
        }
    },
    {
        name: "Investor Mark",
        email: "mark@investor.com",
        role: "investor",
        profile: {
            investorName: "Mark Ventures",
            firmName: "Capital Wave",
            investorType: "VC",
            location: "London, UK",
            description: "Growth stage investor focusing on deep tech and robotics.",
            preferredIndustries: ["Robotics", "AI", "Manufacturing"],
            isPublic: true,
            status: "approved"
        }
    },
    {
        name: "Investor Elena",
        email: "elena@investor.com",
        role: "investor",
        profile: {
            investorName: "Elena Angel",
            firmName: "Angel Circle",
            investorType: "Angel",
            location: "Singapore",
            description: "Early stage angel investor in sustainability and cleantech.",
            preferredIndustries: ["Cleantech", "Energy", "Social Impact"],
            isPublic: true,
            status: "approved"
        }
    }
];

async function createDemoAccounts() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        console.log("Connected to MongoDB for Demo Account Creation");

        const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

        for (const data of demoUsers) {
            // 1. Create User
            const user = await User.findOneAndUpdate(
                { email: data.email },
                {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    role: data.role,
                    onboardingCompleted: true,
                    isVerified: true
                },
                { upsert: true, new: true }
            );

            console.log(`User created/updated: ${user.email}`);

            // 2. Create Profile
            if (data.role === "startup") {
                await Startup.findOneAndUpdate(
                    { userId: user._id },
                    { ...data.profile, userId: user._id },
                    { upsert: true, new: true }
                );
                console.log(`Startup profile created for: ${data.profile.startupName}`);
            } else if (data.role === "investor") {
                await Investor.findOneAndUpdate(
                    { userId: user._id },
                    { ...data.profile, userId: user._id },
                    { upsert: true, new: true }
                );
                console.log(`Investor profile created for: ${data.profile.investorName}`);
            }
        }

        console.log("\n========================================");
        console.log("DEMO ACCOUNTS READY");
        console.log("Password for all accounts: Password123!");
        console.log("========================================\n");
        
        process.exit(0);
    } catch (error) {
        console.error("Error creating demo accounts:", error);
        process.exit(1);
    }
}

createDemoAccounts();
