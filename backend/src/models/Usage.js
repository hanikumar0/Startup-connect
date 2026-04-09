import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    messagesSent: {
      type: Number,
      default: 0,
    },
    contactsUnlocked: {
      type: Number,
      default: 0,
    },
    profileViews: {
      type: Number,
      default: 0,
    },
    monthlyPeriodStart: {
      type: Date,
      default: Date.now,
    },
    monthlyPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

// Reset usage if period has passed
usageSchema.methods.resetIfNewPeriod = async function () {
  const now = new Date();
  if (now > this.monthlyPeriodEnd) {
    this.messagesSent = 0;
    this.contactsUnlocked = 0;
    this.profileViews = 0;
    this.monthlyPeriodStart = now;
    this.monthlyPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await this.save();
  }
};

export default mongoose.model("Usage", usageSchema);
