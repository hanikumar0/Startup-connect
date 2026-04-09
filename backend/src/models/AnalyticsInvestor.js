import mongoose from "mongoose";

const investorAnalyticsSchema = new mongoose.Schema(
  {
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
      unique: true,
    },
    startupsViewed: { type: Number, default: 0 },
    matchesCount: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 },
    replies: { type: Number, default: 0 },
    meetingsScheduled: { type: Number, default: 0 },
    savedStartups: { type: Number, default: 0 },
    contactUnlocks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("AnalyticsInvestor", investorAnalyticsSchema);
