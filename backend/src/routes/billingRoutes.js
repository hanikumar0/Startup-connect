import express from "express";
import { 
    createCheckoutSession, 
    stripeWebhook, 
    getSubscriptionStatus, 
    cancelSubscription,
    boostProfile,
    unlockContact
} from "../controllers/billingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkAccess } from "../middleware/monetizationMiddleware.js";

const router = express.Router();

// Public webhook route (Stripe needs it without auth)
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Protected billing routes
router.use(protect);

router.post("/create-checkout", createCheckoutSession);
router.get("/subscription", getSubscriptionStatus);
router.put("/cancel", cancelSubscription);
router.post("/boost", checkAccess('featured'), boostProfile);
router.post("/unlock-contact/:id", checkAccess('contactUnlock'), unlockContact);

export default router;
