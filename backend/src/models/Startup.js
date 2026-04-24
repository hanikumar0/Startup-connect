import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    linkedin: { type: String },
    avatar: { type: String },
    bio: { type: String },
});

const socialLinksSchema = new mongoose.Schema({
    website: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    github: { type: String },
});

const startupSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: { unique: true, sparse: true }
        },
        githubStars: {
            type: Number,
            default: 0,
        },
        startupName: {
            type: String,
            required: true,
            trim: true,
        },
        founderName: {
            type: String,
        },
        logo: {
            type: String,
        },
        tagline: {
            type: String,
        },
        description: {
            type: String,
            required: true,
        },
        industry: {
            type: String,
            required: true,
        },
        subIndustry: {
            type: String,
        },
        stage: {
            type: String,
            enum: ["idea", "MVP", "seed", "series A", "revenue", "growth"],
            required: true,
        },
        fundingRequired: {
            type: Number,
            default: 0,
        },
        currency: {
            type: String,
            default: "USD",
        },
        fundingRaised: {
            type: Number,
            default: 0,
        },
        valuation: {
            type: Number,
        },
        foundedYear: {
            type: Number,
        },
        teamSize: {
            type: Number,
        },
        location: {
            type: String,
            required: true,
        },
        website: {
            type: String,
        },
        pitchDeckUrl: {
            type: String,
        },
        demoUrl: {
            type: String,
        },
        problemStatement: {
            type: String,
        },
        solution: {
            type: String,
        },
        businessModel: {
            type: String,
        },
        marketSize: {
            type: String,
        },
        tractionMetrics: {
            type: String,
        },
        revenue: {
            type: Number,
            default: 0,
        },
        users: {
            type: Number,
            default: 0,
        },
        growthRate: {
            type: String,
        },
        tags: [String],
        teamMembers: [teamMemberSchema],
        socialLinks: socialLinksSchema,
        isPublic: {
            type: Boolean,
            default: true,
        },
        isClaimed: {
            type: Boolean,
            default: false,
        },
        claimedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        source: {
            type: String,
            default: "internal",
        },
        sourceUrl: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        boostUntil: {
            type: Date,
        },
        profileScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        visibilityScore: {
            type: Number,
            default: 0
        },
        achievements: [{
            title: String,
            date: Date,
            type: { type: String, enum: ["Certification", "Award", "Milestone", "Other"] }
        }],
        recentUpdates: [{
            updateType: String,
            description: String,
            date: { type: Date, default: Date.now }
        }],
        trustBadges: [String],
        lastAIPulled: { type: Date },

        // AI Funding Readiness Score Fields
        fundingScore: { type: Number, default: 0 },
        fundingStage: { 
            type: String, 
            enum: ["Not Ready", "Early Progress", "Pre-Seed Ready", "Seed Ready", "Series A Ready"], 
            default: "Not Ready" 
        },
        scoreBreakdown: {
            profile: { type: Number, default: 0 },
            traction: { type: Number, default: 0 },
            team: { type: Number, default: 0 },
            deck: { type: Number, default: 0 },
            metrics: { type: Number, default: 0 }
        },
        scoreReasons: [String],
        aiSuggestions: [String],
        lastCalculatedAt: { type: Date },

        // Extended Business Metrics for Analysis
        metrics: {
            monthlyActiveUsers: { type: Number, default: 0 },
            dailyActiveUsers: { type: Number, default: 0 },
            customers: { type: Number, default: 0 },
            mrr: { type: Number, default: 0 },
            arr: { type: Number, default: 0 },
            retentionRate: { type: Number, default: 0 },
            waitlistCount: { type: Number, default: 0 },
            cac: { type: Number, default: 0 }, // Customer Acquisition Cost
            ltv: { type: Number, default: 0 }, // Lifetime Value
            burnRate: { type: Number, default: 0 },
            runwayMonths: { type: Number, default: 0 },
            grossMargin: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

export default mongoose.model("Startup", startupSchema);
