import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "reminder_15min",
        "instant_start",
        "cancelled",
        "rescheduled",
        "meeting_request",
        "meeting_accepted",
        "meeting_rejected",
        "profile_viewed",
        "startup_saved",
        "investor_saved",
        "pitch_downloaded",
        "subscription_updated",
        "system_alert",
        "claim_request",
        "claim_approved",
        "identity_verified"
      ],
      required: true,
    },
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meeting",
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast fetch of user notifications
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
