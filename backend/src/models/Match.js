import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
    {
        startupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Startup",
            required: true,
        },
        investorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Investor",
            required: true,
        },
        score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        reasons: [String],
        status: {
            type: String,
            enum: ["NEW", "VIEWED", "CONNECTED", "DISMISSED"],
            default: "NEW",
        },
    },
    { timestamps: true }
);

// Unique index to prevent duplicate matches
matchSchema.index({ startupId: 1, investorId: 1 }, { unique: true });

export default mongoose.model("Match", matchSchema);
