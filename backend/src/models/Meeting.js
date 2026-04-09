import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
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
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        meetingDate: {
            type: Date,
            required: true,
        },
        meetingTime: {
            type: String,
            required: true,
        },
        duration: {
            type: Number, // In minutes
            default: 30,
        },
        timezone: {
            type: String,
            default: "UTC",
        },
        meetingLink: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
            default: "pending",
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
    },
    { timestamps: true }
);

// Index for quick lookups
meetingSchema.index({ startupId: 1, meetingDate: 1 });
meetingSchema.index({ investorId: 1, meetingDate: 1 });

export default mongoose.model("Meeting", meetingSchema);
