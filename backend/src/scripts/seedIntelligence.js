import mongoose from "mongoose";
import dotenv from "dotenv";
import MarketIntelligence from "../models/MarketIntelligence.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../", ".env") });

const intelligenceData = [
    {
        title: "Global AI Funding Surge: $15B Raised in Q1 2026",
        summary: "Synthetic intelligence startups dominate the venture capital landscape as foundation model competition intensifies.",
        type: "news",
        category: "AI",
        source: "TechCrunch",
        sourceUrl: "https://techcrunch.com",
        tags: ["AI", "Funding", "Trends"],
        targetAudience: "all",
        aiInsights: "Investors are shifting focus from general LLMs to specialized vertical AI applications."
    },
    {
        title: "Founders Pitch Night: New Delhi Edition",
        summary: "Join the top 50 founders in Delhi for a night of high-stakes pitching and networking with seed-stage investors.",
        type: "event",
        category: "Fintech",
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: "Aerocity, New Delhi",
        isOnline: false,
        registerUrl: "https://startupconnect.ai/events/delhi-pitch",
        targetAudience: "startup"
    },
    {
        title: "Seed Fund 2026: Government of India Grant",
        summary: "Ministry of Commerce announces ₹2,000 Cr grant pool for early-stage tech startups in tier 2 cities.",
        type: "grant",
        category: "Government",
        source: "Startup India",
        sourceUrl: "https://startupindia.gov.in",
        tags: ["Grant", "India", "Seed"],
        targetAudience: "startup"
    },
    {
        title: "Y Combinator S26 Applications Open",
        summary: "The world's most prestigious accelerator is now accepting applications for its Summer 2026 cohort.",
        type: "accelerator",
        category: "General",
        source: "Y Combinator",
        registerUrl: "https://ycombinator.com/apply",
        targetAudience: "startup"
    },
    {
        title: "VC Investment Thesis: Future of Web3",
        summary: "Top VC firms are redefining their Web3 strategy to focus on consumer-layer decentralized applications.",
        type: "news",
        category: "Web3",
        source: "VentureBeat",
        targetAudience: "investor",
        aiInsights: "Infrastructure remains oversaturated; consumer dApps are the new alpha."
    },
    {
        title: "Fundraising Masterclass: Series A Readiness",
        summary: "Exclusive workshop for founders preparing for their Series A round. Learn how to structure your pitch and metrics.",
        type: "workshop",
        category: "Education",
        eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        isOnline: true,
        registerUrl: "https://startupconnect.ai/workshops/series-a",
        targetAudience: "startup"
    },
    {
        title: "Fintech Acquisition: Stripe Buys PayLater",
        summary: "Stripe expands its credit footprint in India by acquiring the leading BNPL startup for $450M.",
        type: "news",
        category: "Fintech",
        source: "Economic Times",
        tags: ["M&A", "Fintech", "India"],
        targetAudience: "all"
    }
];

const seedIntelligence = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for seeding...");

        await MarketIntelligence.deleteMany({});
        await MarketIntelligence.insertMany(intelligenceData);

        console.log("Intelligence Hub seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
};

seedIntelligence();
