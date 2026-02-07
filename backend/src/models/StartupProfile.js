import mongoose from "mongoose";

const startupProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        companyName: {
            type: String,
            required: true,
        },
        ownerName: {
            type: String,
            required: true,
        },
        teamSize: {
            type: Number,
            default: 1,
        },
        yearFounded: {
            type: Number,
        },
        industry: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        history: {
            type: String,
        },
        fundingStage: {
            type: String,
            enum: ["PRE-SEED", "SEED", "SERIES-A", "SERIES-B", "LATE-STAGE"],
            required: true,
        },
        fundingRequired: {
            type: Number,
            required: true,
        },
        pitchDeckUrl: {
            type: String,
        },
        website: {
            type: String,
        },
        logoUrl: {
            type: String,
        },
        tags: [String],
    },
    { timestamps: true }
);

export default mongoose.model("StartupProfile", startupProfileSchema);
