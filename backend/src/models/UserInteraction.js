import mongoose from "mongoose";

const userInteractionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        targetUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        action: {
            type: String,
            enum: ["view", "connect", "chat", "ignore"],
            required: true
        },
        metadata: {
            focus: [String],
            tags: [String],
            stage: String,
            fundingRange: String
        },
        weight: {
            type: Number,
            required: true
        }
    },
    { timestamps: true }
);

// Index for efficiency in learning loop
userInteractionSchema.index({ userId: 1, action: 1, createdAt: -1 });

export default mongoose.model("UserInteraction", userInteractionSchema);
