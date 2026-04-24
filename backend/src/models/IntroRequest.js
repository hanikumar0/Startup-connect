
import mongoose from "mongoose";

const introRequestSchema = new mongoose.Schema(
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
        connectorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // The person providing the introduction
            required: true,
        },
        requesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Person who requested it (founder)
            required: true,
        },
        status: {
            type: String,
            enum: ["REQUESTED", "CO_ACCEPTED", "CO_DECLINED", "INTRO_SENT", "INV_ACCEPTED", "INV_DECLINED", "COMPLETED"],
            default: "REQUESTED",
        },
        message: {
            type: String,
            required: true, // "Purpose and why fit"
        },
        pitchBrief: {
            type: String, // Mini-deck or brief
        },
        introStrengthScore: {
            type: Number,
            default: 0,
        },
        introPath: [
            {
                role: String, // "Founder", "Mentor", "Alumni"
                name: String,
                userId: mongoose.Schema.Types.ObjectId
            }
        ],
        connectorNote: {
            type: String, // Note from connector to investor
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
        repliedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Index for quick lookups
introRequestSchema.index({ startupId: 1, investorId: 1, connectorId: 1 });

export default mongoose.model("IntroRequest", introRequestSchema);
