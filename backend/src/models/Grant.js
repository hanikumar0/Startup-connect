import mongoose from "mongoose";

const grantSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        provider: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["grant", "accelerator", "incubator", "competition", "workshop", "program"],
            default: "grant",
        },
        description: {
            type: String,
            trim: true,
        },
        deadline: {
            type: Date,
        },
        deadlineText: {
            type: String, // e.g. "Rolling", "Q3 2025"
        },
        eligibility: {
            type: String,
        },
        sectors: [{ type: String }],  // e.g. ["AI", "SaaS", "Fintech"]
        stages: [{ type: String }],   // e.g. ["Idea", "MVP", "Seed"]
        country: {
            type: String,
            default: "India",
        },
        fundingAmount: {
            type: String, // "₹10L - ₹50L"
        },
        applyUrl: {
            type: String,
        },
        source: {
            type: String,
            enum: ["startup_india", "government", "incubator", "accelerator", "university", "corporate", "manual", "other"],
            default: "other",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        tags: [{ type: String }],
        matchReasons: [{ type: String }], // "Matches your fintech sector"
        views: { type: Number, default: 0 },
        applications: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Text search index
grantSchema.index({ title: "text", description: "text", provider: "text", sectors: "text" });
grantSchema.index({ type: 1, isActive: 1, deadline: 1 });
grantSchema.index({ sectors: 1, stages: 1, country: 1 });

export default mongoose.model("Grant", grantSchema);
