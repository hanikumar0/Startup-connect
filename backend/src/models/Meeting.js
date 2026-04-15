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
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                email: String,
                status: {
                    type: String,
                    enum: ["pending", "accepted", "declined", "joined", "left"],
                    default: "pending",
                },
                joinedAt: Date,
                leftAt: Date,
            },
        ],
        providerType: {
            type: String,
            enum: ["google", "google_meet", "zoom", "microsoft_teams", "internal", "custom"],
            required: true,
            default: "internal",
        },
        providerMetadata: {
            meetingId: String,
            joinUrl: String,
            startUrl: String,
            conferenceData: mongoose.Schema.Types.Mixed,
        },
        meetingLink: {
            type: String,
        },
        agenda: {
            type: String,
            trim: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number,
            default: 60,
        },
        timezone: {
            type: String,
            default: "UTC",
        },
        status: {
            type: String,
            enum: ["scheduled", "ongoing", "completed", "cancelled", "ended", "cancellation_requested", "reschedule_requested"],
            default: "scheduled",
        },
        cancellationRequests: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                reason: { type: String, required: true },
                status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
                createdAt: { type: Date, default: Date.now },
            }
        ],
        rescheduleRequests: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                proposedStartTime: { type: Date, required: true },
                proposedDuration: { type: Number, required: true },
                note: String,
                status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
                createdAt: { type: Date, default: Date.now },
            }
        ],
        attendanceLog: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                action: { type: String, enum: ["join", "leave", "no-show"] },
                timestamp: { type: Date, default: Date.now },
            }
        ],
        cancellationReason: {
            type: String,
        },
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

meetingSchema.virtual('endTime').get(function() {
    if (!this.startTime || !this.duration) return null;
    return new Date(this.startTime.getTime() + this.duration * 60000);
});

meetingSchema.virtual('computedStatus').get(function() {
    const now = new Date();
    if (this.status === "cancelled" || this.status === "ended") return this.status;

    if (now < this.startTime) return "scheduled";

    const endTime = new Date(this.startTime.getTime() + this.duration * 60000);
    if (now > endTime) return "ended";

    return "live";
});

// Indexes
meetingSchema.index({ hostId: 1, startTime: 1 });
meetingSchema.index({ "participants.userId": 1, startTime: 1 });
meetingSchema.index({ status: 1 });

export default mongoose.model("Meeting", meetingSchema);
