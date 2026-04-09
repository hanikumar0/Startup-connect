import Subscription from "../models/Subscription.js";
import Usage from "../models/Usage.js";

// @desc    Plans & Limits Definition
const PLAN_LIMITS = {
  free: {
    messages: 5,
    contactUnlock: false,
    featured: false,
  },
  pro: {
    messages: 999999,
    contactUnlock: true,
    featured: false,
  },
  premium: {
    messages: 999999,
    contactUnlock: true,
    featured: true,
  }
};

// @desc    Middleware to check subscription status and limits
export const checkAccess = (feature) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ userId: req.user.id });
      const plan = subscription ? subscription.plan : "free";
      const limits = PLAN_LIMITS[plan];

      // 1. Check if plan allows feature
      if (feature === 'contactUnlock' && !limits.contactUnlock) {
        return res.status(403).json({ 
            success: false, 
            message: "Feature Locked: Upgrade to PRO to unlock contact details.",
            code: "UPGRADE_REQUIRED"
        });
      }

      if (feature === 'featured' && !limits.featured) {
        return res.status(403).json({ 
            success: false, 
            message: "Feature Locked: PREMIUM membership required for featured status.",
            code: "UPGRADE_REQUIRED"
        });
      }

      // 2. Check usage limits (specifically for messaging)
      if (feature === 'messaging') {
        let usage = await Usage.findOne({ userId: req.user.id });
        if (!usage) {
           usage = await Usage.create({ userId: req.user.id });
        }

        await usage.resetIfNewPeriod();

        if (usage.messagesSent >= limits.messages) {
            return res.status(403).json({ 
                success: false, 
                message: "Monthly quota exceeded. Upgrade for unlimited messaging.",
                code: "QUOTA_EXCEEDED"
            });
        }

        // Increment for tracking (controller will handle actual send, but we check here)
        req.usage = usage;
      }

      req.plan = plan;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

export const isPremium = async (req, res, next) => {
    const sub = await Subscription.findOne({ userId: req.user.id });
    if (sub && (sub.plan === 'pro' || sub.plan === 'premium') && sub.status === 'active') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Premium access required." });
    }
};
