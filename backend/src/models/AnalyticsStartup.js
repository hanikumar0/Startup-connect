import mongoose from "mongoose";

const startupAnalyticsSchema = new mongoose.Schema(
  {
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
      unique: true,
    },
    profileViews: { type: Number, default: 0 },
    pitchDownloads: { type: Number, default: 0 },
    messagesReceived: { type: Number, default: 0 },
    meetingsBooked: { type: Number, default: 0 },
    savedCount: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    matchClicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("AnalyticsStartup", startupAnalyticsSchema);
