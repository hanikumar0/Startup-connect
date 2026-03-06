import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

// Define models locally since we can't easily import from src in a script without proper setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: { type: String, select: false },
    role: String,
    isProfileCompleted: { type: Boolean, default: false }
}, { timestamps: true });

const InvestorProfileSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    firmName: String,
    investorType: String,
    industries: [String],
    fundingStages: [String],
    minInvestment: Number,
    maxInvestment: Number,
    bio: String
}, { timestamps: true });

const StartupProfileSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    companyName: String,
    ownerName: String,
    industry: String,
    description: String,
    fundingStage: String,
    fundingRequired: Number
}, { timestamps: true });

const DealSchema = new mongoose.Schema({
    startup: mongoose.Schema.Types.ObjectId,
    investor: mongoose.Schema.Types.ObjectId,
    investorProfile: mongoose.Schema.Types.ObjectId,
    stage: String,
    amount: Number,
    priority: String
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const InvestorProfile = mongoose.model('InvestorProfile', InvestorProfileSchema);
const StartupProfile = mongoose.model('StartupProfile', StartupProfileSchema);
const Deal = mongoose.model('Deal', DealSchema);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await InvestorProfile.deleteMany({});
        await StartupProfile.deleteMany({});
        await Deal.deleteMany({});
        console.log('Cleared existing data');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create a Demo Startup User
        const startupUser = await User.create({
            name: 'Jane Founder',
            email: 'startup@demo.com',
            password: hashedPassword,
            role: 'STARTUP',
            isProfileCompleted: true
        });

        await StartupProfile.create({
            userId: startupUser._id,
            companyName: 'NexGen AI',
            ownerName: 'Jane Founder',
            industry: 'Artificial Intelligence',
            description: 'Building the next generation of generative AI tools for enterprise.',
            fundingStage: 'SEED',
            fundingRequired: 1500000
        });

        // 2. Create some Investors
        const investors = [
            { name: 'Alex Venture', email: 'alex@sequoia.com', firm: 'Sequoia Capital', type: 'VC', bio: 'Focus on early-stage AI and SaaS.' },
            { name: 'Sarah Angel', email: 'sarah@angel.co', firm: 'Sarah Angels', type: 'ANGEL', bio: 'Passionate about sustainable tech.' },
            { name: 'Michael Tech', email: 'michael@google.com', firm: 'Google Ventures', type: 'CORPORATE', bio: 'Strategic investments in deep tech.' }
        ];

        const createdInvestors = [];
        for (const inv of investors) {
            const user = await User.create({
                name: inv.name,
                email: inv.email,
                password: hashedPassword,
                role: 'INVESTOR',
                isProfileCompleted: true
            });

            const profile = await InvestorProfile.create({
                userId: user._id,
                firmName: inv.firm,
                investorType: inv.type,
                industries: ['AI', 'SaaS', 'Fintech'],
                fundingStages: ['SEED', 'SERIES-A'],
                minInvestment: 100000,
                maxInvestment: 5000000,
                bio: inv.bio
            });

            createdInvestors.push({ user, profile });
        }

        // 3. Create some Deals for our Demo Startup
        const dealData = [
            { investorIdx: 0, stage: 'TERM_SHEET', amount: 500000, priority: 'HIGH' },
            { investorIdx: 1, stage: 'DILIGENCE', amount: 250000, priority: 'MEDIUM' },
            { investorIdx: 2, stage: 'CONTACTED', amount: 750000, priority: 'LOW' }
        ];

        for (const d of dealData) {
            await Deal.create({
                startup: startupUser._id,
                investor: createdInvestors[d.investorIdx].user._id,
                investorProfile: createdInvestors[d.investorIdx].profile._id,
                stage: d.stage,
                amount: d.amount,
                priority: d.priority
            });
        }

        console.log('Seeding completed successfully!');
        console.log('Demo Login: startup@demo.com / password123');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seed();
