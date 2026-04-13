import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import { createNotification } from "../services/notificationService.js";
import User from "../models/User.js";

// @desc    Request to claim a profile
// @route   POST /api/claim/startup/:id | POST /api/claim/investor/:id
export const requestClaim = async (req, res) => {
    try {
        const { type } = req.params;
        const targetId = req.params.id;
        const userId = req.user.id;

        let profile;
        if (type === "startup") {
            profile = await Startup.findById(targetId);
        } else {
            profile = await Investor.findById(targetId);
        }

        if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
        if (profile.isClaimed) return res.status(400).json({ success: false, message: "Profile already claimed" });

        const admins = await User.find({ role: "admin" });
        for (const admin of admins) {
            await createNotification({
                userId: admin._id,
                sender: userId,
                type: "claim_request",
                title: "New Profile Claim Request",
                message: `${req.user.name} wants to claim ${type === 'startup' ? profile.startupName : profile.investorName}`,
                link: `/admin/claims`
            });
        }

        res.status(200).json({ success: true, message: "Claim request submitted for verification" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin approve claim
// @route   PUT /api/admin/approve-claim/:type/:id
export const approveClaim = async (req, res) => {
    try {
        const { type, id } = req.params;
        const { approvedUserId } = req.body;

        let profile;
        if (type === "startup") {
            profile = await Startup.findByIdAndUpdate(id, { 
                isClaimed: true, 
                claimedBy: approvedUserId,
                userId: approvedUserId 
            }, { new: true });
        } else {
            profile = await Investor.findByIdAndUpdate(id, { 
                isClaimed: true, 
                claimedBy: approvedUserId,
                userId: approvedUserId
            }, { new: true });
        }

        // Notify user
        await createNotification({
            userId: approvedUserId,
            sender: req.user.id,
            type: "claim_approved",
            title: "Profile Claim Approved",
            message: `Your claim for ${profile.startupName || profile.investorName} has been approved!`,
            link: `/${type}/dashboard`
        });

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
