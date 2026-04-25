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
        // Meeting alerts (existing)
        "reminder_15min",
        "instant_start",
        "cancelled",
        "rescheduled",
        "meeting_request",
        "meeting_accepted",
        "meeting_rejected",
        // Profile/save alerts (existing)
        "profile_viewed",
        "startup_saved",
        "investor_saved",
        "pitch_downloaded",
        "subscription_updated",
        "system_alert",
        "claim_request",
        "claim_approved",
        "identity_verified",
        // Smart Alerts — Startup
        "new_investor_match",
        "investor_viewed_profile",
        "warm_intro_available",
        "grant_deadline_soon",
        "funding_score_improved",
        // Smart Alerts — Investor
        "high_fit_startup_added",
        "startup_entered_sector",
        "startup_round_closing",
        "intro_request_received",
        "due_diligence_shared",
        // Smart Alerts — Universal
        "new_message",
        "verification_approved",
        "badge_awarded",
        "feature_unlocked",
        "platform_announcement",
        "new_grant_match",
        "accelerator_match",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["critical", "important", "info"],
      default: "info",
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
