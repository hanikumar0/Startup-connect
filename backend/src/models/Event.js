import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: ["profile_view", "pitch_download", "message_sent", "meeting_booked", "save_profile", "match_clicked", "contact_unlock"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      enum: ["startup", "investor", "user"],
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    }
  },
  { timestamps: true }
);

// Index for fast analytics queries
eventSchema.index({ targetId: 1, type: 1, createdAt: -1 });
eventSchema.index({ userId: 1, type: 1, createdAt: -1 });

export default mongoose.model("Event", eventSchema);
