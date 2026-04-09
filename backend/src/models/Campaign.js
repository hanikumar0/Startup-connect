import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["startup", "investor"], required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["draft", "sent"], default: "draft" },
    sentCount: { type: Number, default: 0 },
    replyCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Campaign", campaignSchema);
