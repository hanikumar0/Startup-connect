import mongoose from "mongoose";

const portfolioCompanySchema = new mongoose.Schema({
    name: { type: String, required: true },
    logo: { type: String },
    website: { type: String },
    stage: { type: String },
    yearInvested: { type: Number },
    description: { type: String },
});

const investorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: { unique: true, sparse: true }
        },
        investorName: {
            type: String,
            required: true,
            trim: true,
        },
        firmName: {
            type: String,
        },
        logo: {
            type: String,
        },
        investorType: {
            type: String,
            enum: ["Angel", "VC", "Micro VC", "Family Office", "Accelerator", "Incubator", "Corporate VC", "Syndicate", "Private Equity", "Venture Capital Investor"],
            required: true,
        },
        bio: {
            type: String,
            required: true,
        },
        website: {
            type: String,
        },
        location: {
            type: String,
            required: true,
        },
        checkSizeMin: {
            type: Number,
            required: true,
        },
        checkSizeMax: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "USD",
        },
        preferredStages: [
            {
                type: String,
                enum: ["Idea", "MVP", "Revenue", "Growth", "Series A", "Series B", "Seed", "Pre-seed"],
            },
        ],
        preferredIndustries: [String],
        preferredGeographies: [String],
        investmentThesis: {
            type: String,
        },
        portfolioCompanies: [portfolioCompanySchema],
        totalInvestments: {
            type: Number,
            default: 0,
        },
        linkedin: {
            type: String,
        },
        twitter: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
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
        lastAIPulled: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model("Investor", investorSchema);
