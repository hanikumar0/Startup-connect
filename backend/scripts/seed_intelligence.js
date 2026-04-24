
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const MarketIntelligenceSchema = new mongoose.Schema({
    title: String,
    summary: String,
    content: String,
    source: String,
    sourceUrl: String,
    type: String,
    category: String,
    status: String,
    date: { type: Date, default: Date.now },
    eventDate: Date,
    location: String,
    isOnline: Boolean,
    aiInsights: String,
    tags: [String],
    imageUrl: String
}, { timestamps: true });

const MarketIntelligence = mongoose.model('MarketIntelligence', MarketIntelligenceSchema, 'marketintelligences');

const seedData = [
    {
        title: "Global Venture Capital Trends 2026: The Rise of Sovereign Wealth",
        summary: "An in-depth analysis of how sovereign wealth funds are becoming the primary drivers of late-stage startup funding in emerging markets, with a focus on India and SE Asia.",
        source: "Global Ecosystem Report",
        sourceUrl: "https://example.com/vc-trends-2026",
        type: "trend",
        category: "Investments",
        status: "active",
        aiInsights: "Direct investment from SWFs is expected to grow by 40%. Startups should focus on long-term sustainability to attract this patient capital.",
        tags: ["VC", "Trends", "Funding", "Macro"],
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "DeepTech Masterclass: From Lab to Market",
        summary: "A practical guide for technical founders on how to commercialize scientific breakthroughs and manage the long R&D cycles of deep-tech startups.",
        source: "Startup Academy",
        sourceUrl: "https://example.com/deeptech-masterclass",
        type: "workshop",
        category: "Education",
        status: "active",
        eventDate: new Date(Date.now() + 86400000 * 5),
        location: "Virtual / Zoom",
        isOnline: true,
        aiInsights: "Focus on early IP protection and finding 'bridge' markets to generate revenue before core tech is fully mature.",
        tags: ["DeepTech", "Masterclass", "IP", "Strategy"],
        imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Scale-up Grant 2026: $500k Non-Dilutive Funding for SaaS",
        summary: "The annual scale-up grant is now open for applications. Targeted at SaaS companies with >$1M ARR looking to expand into North American markets.",
        source: "SaaS Foundation",
        sourceUrl: "https://example.com/saas-grant-2026",
        type: "grant",
        category: "Grants",
        status: "active",
        eventDate: new Date(Date.now() + 86400000 * 30),
        location: "International",
        isOnline: true,
        aiInsights: "Highest success rates are seen in startups with cross-border compliance ready. Use this for marketing and sales expansion, not core dev.",
        tags: ["Grant", "SaaS", "Funding", "Global"],
        imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"
    },
    {
        title: "Venture Insights: why GenAI Infrastructure is the new Gold Rush",
        summary: "Market analysis on the shift from GenAI applications to the underlying infrastructure layer, where sustainable margins are currently being built.",
        source: "Venture Pulse",
        sourceUrl: "https://example.com/genai-infra-trends",
        type: "trend",
        category: "AI",
        status: "active",
        aiInsights: "Infrastructure plays are seeing 15x revenue multiples. Consolidation at the app layer is imminent.",
        tags: ["AI", "GenAI", "Infrastructure", "Investment"],
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const item of seedData) {
            const existing = await MarketIntelligence.findOne({ sourceUrl: item.sourceUrl });
            if (!existing) {
                await MarketIntelligence.create(item);
                console.log(`Created: ${item.title}`);
            } else {
                console.log(`Skipped (exists): ${item.title}`);
            }
        }

        console.log('Seeding completed.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
