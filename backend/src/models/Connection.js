import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "ACCEPTED", "REJECTED"],
            default: "PENDING",
        },
        message: {
            type: String,
        },
    },
    { timestamps: true }
);

// Prevent duplicate connection requests
connectionSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export default mongoose.model("Connection", connectionSchema);
