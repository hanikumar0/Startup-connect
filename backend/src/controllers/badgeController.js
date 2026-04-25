import User from "../models/User.js";
import VerificationRequest from "../models/VerificationRequest.js";
import Notification from "../models/Notification.js";
import Startup from "../models/Startup.js";
import logger from "../config/logger.js";

// ─── Badge Definitions ────────────────────────────────────────────────────────
const BADGE_META = {
    // Startup
    verified_startup: { label: "Verified Startup", color: "indigo", icon: "ShieldCheck" },
    registered_company: { label: "Registered Company", color: "blue", icon: "Building2" },
    raising_now: { label: "Raising Now", color: "emerald", icon: "TrendingUp" },
    high_traction: { label: "High Traction", color: "amber", icon: "Zap" },
    active_founder: { label: "Active Founder", color: "violet", icon: "User" },
    top_rated_startup: { label: "Top Rated Startup", color: "orange", icon: "Star" },
    // Investor
    verified_investor: { label: "Verified Investor", color: "indigo", icon: "ShieldCheck" },
    active_investor: { label: "Active Investor", color: "emerald", icon: "Activity" },
    recent_investor: { label: "Recent Investor", color: "blue", icon: "Clock" },
    trusted_vc: { label: "Trusted VC", color: "violet", icon: "Award" },
    fast_responder: { label: "Fast Responder", color: "green", icon: "Zap" },
    premium_investor: { label: "Premium Investor", color: "amber", icon: "Crown" },
    // Mentor
    trusted_mentor: { label: "Trusted Mentor", color: "purple", icon: "GraduationCap" },
    expert_advisor: { label: "Expert Advisor", color: "indigo", icon: "BrainCircuit" },
    top_connector: { label: "Top Connector", color: "blue", icon: "Network" },
};

export const getBadgeMeta = () => BADGE_META;

// ─── Auto-compute eligible badges for a user ─────────────────────────────────
async function computeEligibleBadges(user, startup) {
    const badges = [];

    if (user.role === "startup") {
        // Verified Startup: email + kyc verified
        if (user.emailVerified && user.kycStatus === "verified") badges.push("verified_startup");
        // Registered Company: KYC with company doc
        if (user.kycData?.companyDoc || user.kycData?.registrationNumber) badges.push("registered_company");
        // Raising Now: has active raise round
        if (startup?.fundingRequired > 0 && startup?.stage !== "idea") badges.push("raising_now");
        // High Traction: metrics
        if (startup?.metrics?.mrr > 0 || startup?.revenue > 0 || startup?.users > 100) badges.push("high_traction");
        // Active Founder: logged in recently + profile complete
        if (user.lastLogin && Date.now() - new Date(user.lastLogin) < 7 * 24 * 60 * 60 * 1000) badges.push("active_founder");
        // Top Rated Startup: high profile score
        if (startup?.profileScore >= 80) badges.push("top_rated_startup");
    }

    if (user.role === "investor") {
        // Verified Investor: KYC verified
        if (user.kycStatus === "verified") badges.push("verified_investor");
        // Active Investor: investments made
        if (user.investmentsMadeCount >= 1) badges.push("active_investor");
        // Recent Investor: invested in last 12 months
        if (user.investmentsMadeCount >= 1 && user.lastLogin) badges.push("recent_investor");
        // Trusted VC: high reliability + investments
        if (user.reliabilityScore >= 85 && user.investmentsMadeCount >= 3) badges.push("trusted_vc");
        // Fast Responder: quick meeting accept rate (reliability)
        if (user.reliabilityScore >= 90) badges.push("fast_responder");
        // Premium Investor: top tier
        if (user.investorType === "Firm" && user.investmentsMadeCount >= 5) badges.push("premium_investor");
    }

    return badges;
}

// ─── POST /api/badges/request — User requests verification ───────────────────
export const requestVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { linkedinUrl, companyRegDoc, gstNumber, cinNumber, msmeNumber, websiteUrl, additionalNotes } = req.body;

        // Check for existing pending request
        const existing = await VerificationRequest.findOne({ userId, status: { $in: ["pending", "under_review"] } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You already have a verification request pending.",
                requestId: existing._id,
            });
        }

        const user = req.user;
        const startup = user.role === "startup" ? await Startup.findOne({ userId }) : null;
        const eligibleBadges = await computeEligibleBadges(user, startup);

        const vreq = await VerificationRequest.create({
            userId,
            role: user.role,
            requestedBadges: eligibleBadges,
            linkedinUrl,
            companyRegDoc,
            gstNumber,
            cinNumber,
            msmeNumber,
            websiteUrl,
            additionalNotes,
            emailDomainVerified: user.emailVerified,
            linkedinVerified: !!linkedinUrl,
        });

        // Update user verification status
        await User.findByIdAndUpdate(userId, { verificationStatus: "pending" });

        logger.info({ userId, requestId: vreq._id }, "[Badges] Verification Request Submitted");
        res.status(201).json({ success: true, request: vreq, eligibleBadges });
    } catch (err) {
        logger.error({ err }, "[Badges] requestVerification failed");
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/badges/status — Get user's badge & verification status ──────────
export const getVerificationStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("badges verificationStatus trustScore badgesAwardedAt role emailVerified kycStatus");
        const request = await VerificationRequest.findOne({ userId }).sort({ createdAt: -1 });

        const startup = user.role === "startup" ? await Startup.findOne({ userId }) : null;
        const eligibleBadges = await computeEligibleBadges(user, startup);

        res.json({
            success: true,
            badges: user.badges || [],
            verificationStatus: user.verificationStatus,
            trustScore: user.trustScore || 0,
            badgesAwardedAt: user.badgesAwardedAt,
            latestRequest: request,
            eligibleBadges,
            badgeMeta: BADGE_META,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/badges/meta — Public badge metadata ────────────────────────────
export const getBadgeMetadata = async (req, res) => {
    res.json({ success: true, badges: BADGE_META });
};

// ─── PUT /api/badges/preferences — Update alert preferences ──────────────────
export const updateAlertPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        const { mode, emailAlerts, investorMatch, profileViewed, grantAlerts, meetingReminders, marketingAlerts, enabled } = req.body;

        const update = {};
        if (mode !== undefined) update["alertPreferences.mode"] = mode;
        if (emailAlerts !== undefined) update["alertPreferences.emailAlerts"] = emailAlerts;
        if (investorMatch !== undefined) update["alertPreferences.investorMatch"] = investorMatch;
        if (profileViewed !== undefined) update["alertPreferences.profileViewed"] = profileViewed;
        if (grantAlerts !== undefined) update["alertPreferences.grantAlerts"] = grantAlerts;
        if (meetingReminders !== undefined) update["alertPreferences.meetingReminders"] = meetingReminders;
        if (marketingAlerts !== undefined) update["alertPreferences.marketingAlerts"] = marketingAlerts;
        if (enabled !== undefined) update["alertPreferences.enabled"] = enabled;

        const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).select("alertPreferences");
        res.json({ success: true, alertPreferences: user.alertPreferences });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/badges/preferences — Get alert preferences ─────────────────────
export const getAlertPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("alertPreferences");
        res.json({ success: true, alertPreferences: user.alertPreferences });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Approve verification ─────────────────────────────────────────────
export const adminApproveVerification = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { badges, adminNotes } = req.body;
        const adminId = req.user.id;

        const vreq = await VerificationRequest.findById(requestId);
        if (!vreq) return res.status(404).json({ success: false, message: "Request not found" });

        const badgesToAward = badges || vreq.requestedBadges;

        // Award badges to user
        await User.findByIdAndUpdate(vreq.userId, {
            $addToSet: { badges: { $each: badgesToAward } },
            verificationStatus: "verified",
            badgesAwardedAt: new Date(),
            $inc: { trustScore: Math.min(30, badgesToAward.length * 10) },
        });

        // Update request
        vreq.status = "approved";
        vreq.awardedBadges = badgesToAward;
        vreq.manualApproved = true;
        vreq.reviewedBy = adminId;
        vreq.reviewedAt = new Date();
        vreq.adminNotes = adminNotes;
        await vreq.save();

        // Send notification
        const badgeLabels = badgesToAward.map(b => BADGE_META[b]?.label || b).join(", ");
        await Notification.create({
            userId: vreq.userId,
            type: "badge_awarded",
            priority: "important",
            title: "🏅 Badge Awarded!",
            message: `You've earned: ${badgeLabels}. Your trust score has increased!`,
            link: "/dashboard/settings/verification",
        });

        logger.info({ userId: vreq.userId, badges: badgesToAward }, "[Badges] Badge Awarded");
        res.json({ success: true, awardedBadges: badgesToAward });
    } catch (err) {
        logger.error({ err }, "[Badges] adminApproveVerification failed");
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Reject verification ───────────────────────────────────────────────
export const adminRejectVerification = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { rejectionReason } = req.body;

        const vreq = await VerificationRequest.findByIdAndUpdate(
            requestId,
            {
                status: "rejected",
                rejectionReason,
                reviewedBy: req.user.id,
                reviewedAt: new Date(),
            },
            { new: true }
        );

        if (!vreq) return res.status(404).json({ success: false, message: "Request not found" });

        await User.findByIdAndUpdate(vreq.userId, { verificationStatus: "rejected" });

        await Notification.create({
            userId: vreq.userId,
            type: "system_alert",
            priority: "important",
            title: "Verification Update",
            message: rejectionReason || "Your verification request needs additional information. Please resubmit.",
            link: "/dashboard/settings/verification",
        });

        res.json({ success: true, request: vreq });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: Revoke badge ──────────────────────────────────────────────────────
export const adminRevokeBadge = async (req, res) => {
    try {
        const { userId, badge } = req.body;

        await User.findByIdAndUpdate(userId, {
            $pull: { badges: badge },
            badgesRevokedAt: new Date(),
        });

        await Notification.create({
            userId,
            type: "system_alert",
            priority: "important",
            title: "Badge Revoked",
            message: `Your ${BADGE_META[badge]?.label || badge} badge has been revoked. Contact support for details.`,
        });

        logger.warn({ userId, badge }, "[Badges] Badge Revoked by Admin");
        res.json({ success: true, message: "Badge revoked successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin: List all pending verification requests ────────────────────────────
export const adminListVerificationRequests = async (req, res) => {
    try {
        const { status = "pending", page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const requests = await VerificationRequest.find({ status })
            .populate("userId", "name email role avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await VerificationRequest.countDocuments({ status });
        res.json({ success: true, requests, total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Helper: Create a smart alert ────────────────────────────────────────────
export const createSmartAlert = async ({
    userId, type, priority = "info", title, message, link = null
}) => {
    try {
        const user = await User.findById(userId).select("alertPreferences");
        if (!user?.alertPreferences?.enabled) return null;

        const notif = await Notification.create({ userId, type, priority, title, message, link });
        logger.info({ userId, type }, `[Alerts] Alert Sent: ${type}`);
        return notif;
    } catch (err) {
        logger.error({ err }, "[Alerts] createSmartAlert failed");
        return null;
    }
};
