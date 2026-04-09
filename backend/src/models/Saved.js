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
            enum: ["startup", "investor"],
            required: true,
        },
        isFavorite: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
);

// Ensure a user can't save the same target twice
savedSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.model("Saved", savedSchema);
