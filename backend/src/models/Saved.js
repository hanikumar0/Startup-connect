import mongoose from "mongoose";

const savedSchema = new mongoose.Schema(
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
            enum: ["startup", "investor", "meeting"],
            required: true,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            default: "",
        },
        tags: {
            type: [String],
            default: [],
        },
        // Snapshot fields for resilience (if original entity is deleted)
        title: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Ensure a user can't save the same target twice
savedSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
savedSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });

export default mongoose.model("Saved", savedSchema);
