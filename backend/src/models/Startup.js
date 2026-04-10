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
    },
    { timestamps: true }
);

export default mongoose.model("Startup", startupSchema);
