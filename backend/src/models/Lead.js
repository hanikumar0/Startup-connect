import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    linkedin: { type: String },
    company: { type: String },
    type: { type: String, enum: ["startup", "investor"], required: true },
    industry: { type: String },
    source: { type: String },
    status: {
      type: String,
      enum: ["new", "contacted", "replied", "joined"],
      default: "new",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
