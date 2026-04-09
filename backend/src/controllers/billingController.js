import Stripe from "../config/stripe.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Usage from "../models/Usage.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";

// @desc    Create Stripe Checkout Session
// @route   POST /api/billing/create-checkout
export const createCheckoutSession = async (req, res) => {
    try {
        const { planId, successUrl, cancelUrl } = req.body;
        const user = await req.user;

        // Stripe IDs map for plans
        const planPriceMap = {
            'pro': process.env.STRIPE_PRO_PRICE_ID,
            'premium': process.env.STRIPE_PREMIUM_PRICE_ID
        };

        const session = await Stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price: planPriceMap[planId],
                quantity: 1,
            }],
            mode: "subscription",
            customer_email: user.email,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: user._id.toString(),
                planId: planId
            }
        });

        res.status(200).json({ success: true, sessionId: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Stripe Webhook for handling subscription events
// @route   POST /api/billing/webhook
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;
            const userId = session.metadata.userId;
            const planId = session.metadata.planId;
            
            await Subscription.findOneAndUpdate(
                { userId },
                { 
                    plan: planId, 
                    status: "active",
                    stripeSubscriptionId: session.subscription,
                    stripeCustomerId: session.customer,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Simplistic
                },
                { upsert: true }
            );
            break;
        case "invoice.paid":
            // Renew logic
            break;
        case "customer.subscription.deleted":
            // Mark as cancelled
            break;
    }

    res.json({ received: true });
};

// @desc    Get current subscription
// @route   GET /api/billing/subscription
export const getSubscriptionStatus = async (req, res) => {
    try {
        const sub = await Subscription.findOne({ userId: req.user.id });
        const usage = await Usage.findOne({ userId: req.user.id });
        
        res.status(200).json({ 
            success: true, 
            subscription: sub || { plan: 'free', status: 'active' },
            usage: usage || { messagesSent: 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel subscription
// @route   PUT /api/billing/cancel
export const cancelSubscription = async (req, res) => {
    try {
        const sub = await Subscription.findOne({ userId: req.user.id });
        if (!sub || !sub.stripeSubscriptionId) return res.status(404).json({ message: "No active subscription found" });

        await Stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
        sub.status = "cancelled";
        await sub.save();

        res.status(200).json({ success: true, message: "Subscription will terminate at the end of the period" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Boost profile (for premium users)
// @route   POST /api/billing/boost
export const boostProfile = async (req, res) => {
    try {
        const user = req.user;
        const sub = await Subscription.findOne({ userId: user.id });
        if (!sub || sub.plan !== 'premium') {
            return res.status(403).json({ success: false, message: "PREMIUM membership required for boosting visibility." });
        }

        const boostEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        if (user.role === 'startup') {
            await Startup.findOneAndUpdate({ userId: user.id }, { boostUntil: boostEndDate });
        } else {
            await Investor.findOneAndUpdate({ userId: user.id }, { boostUntil: boostEndDate });
        }

        res.status(200).json({ success: true, message: "Profile boosted for 7 days!", boostUntil: boostEndDate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Unlock contact details
// @route   POST /api/billing/unlock-contact/:id
export const unlockContact = async (req, res) => {
    try {
        // Feature gating handled by middleware, this logic handles tracking
        const { targetId } = req.params;
        const usage = await Usage.findOne({ userId: req.user.id });
        
        if (usage) {
            usage.contactsUnlocked += 1;
            await usage.save();
        }

        res.status(200).json({ success: true, message: "Contact unlocked!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
