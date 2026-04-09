import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    role: {
      type: String,
      enum: ["startup", "investor"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired", "past_due", "trialing"],
      default: "active",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    stripeSubscriptionId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    lastPaymentAmount: {
      type: Number,
    },
    currency: {
      type: String,
      default: "USD",
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
