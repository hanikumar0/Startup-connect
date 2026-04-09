import mongoose from "mongoose";

const recentlyViewedSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        targetType: {
            type: String,
            enum: ["startup", "investor"],
            required: true,
        },
        viewedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Limit list by logic in controller but index for speed
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 });

export default mongoose.model("RecentlyViewed", recentlyViewedSchema);
