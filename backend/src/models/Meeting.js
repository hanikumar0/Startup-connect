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
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        participantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number, // In minutes
            default: 30,
        },
        meetingLink: {
            type: String,
            default: "https://meet.google.com/abc-defg-hij",
        },
        status: {
            type: String,
            enum: ["pending", "scheduled", "accepted", "rejected", "cancelled", "completed"],
            default: "scheduled",
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
    },
    { timestamps: true }
);

// Index for quick lookups
meetingSchema.index({ creatorId: 1, startTime: 1 });
meetingSchema.index({ participantId: 1, startTime: 1 });

export default mongoose.model("Meeting", meetingSchema);
