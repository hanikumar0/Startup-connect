import mongoose from "mongoose";

const marketIntelligenceSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        summary: { type: String, required: true },
        content: { type: String },
        source: { type: String },
        sourceUrl: { type: String },
        type: { 
            type: String, 
            enum: ["news", "event", "workshop", "grant", "accelerator", "trend"],
            required: true 
        },
        category: { type: String }, // e.g. Fintech, AI, Healthtech
        status: { type: String, enum: ["active", "expired", "draft"], default: "active" },
        tags: [String],
        date: { type: Date, default: Date.now },
        eventDate: { type: Date },
        location: { type: String },
        isOnline: { type: Boolean, default: false },
        registerUrl: { type: String },
        imageUrl: { type: String },
        isPremium: { type: Boolean, default: false },
        targetAudience: { 
            type: String, 
            enum: ["startup", "investor", "all"],
            default: "all"
        },
        organizer: { type: String },
        platform: { type: String, default: "platform" }, // e.g. meetup, eventbrite
        slug: { type: String, unique: true, sparse: true },
        publishedAt: { type: Date },
        aiInsights: { type: String }
    },
    { timestamps: true }
);

marketIntelligenceSchema.index({ type: 1, category: 1, date: -1 });

export default mongoose.model("MarketIntelligence", marketIntelligenceSchema);
