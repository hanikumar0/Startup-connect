import Deal from "../models/Deal.js";
import InvestorProfile from "../models/InvestorProfile.js";
import User from "../models/User.js";

export const getMyDeals = async (req, res) => {
    try {
        const deals = await Deal.find({ startup: req.user.id })
            .populate("investor", "name email")
            .populate("investorProfile");

        res.status(200).json({ success: true, deals });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDeal = async (req, res) => {
    try {
        const { investorId, stage, amount, priority } = req.body;
        const startupId = req.user.id;

        // Find investor profile
        const investorProfile = await InvestorProfile.findOne({ userId: investorId });

        const deal = await Deal.create({
            startup: startupId,
            investor: investorId,
            investorProfile: investorProfile?._id,
            stage,
            amount,
            priority
        });

        res.status(201).json({ success: true, deal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateDealStage = async (req, res) => {
    try {
        const { dealId } = req.params;
        const { stage } = req.body;

        const deal = await Deal.findOneAndUpdate(
            { _id: dealId, startup: req.user.id },
            { stage, lastActivity: Date.now() },
            { new: true }
        );

        if (!deal) return res.status(404).json({ message: "Deal not found" });

        res.status(200).json({ success: true, deal });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDeal = async (req, res) => {
    try {
        const { dealId } = req.params;
        await Deal.findOneAndDelete({ _id: dealId, startup: req.user.id });
        res.status(200).json({ success: true, message: "Deal deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
