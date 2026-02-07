import User from "../models/User.js";
import StartupProfile from "../models/StartupProfile.js";
import InvestorProfile from "../models/InvestorProfile.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStartups = await User.countDocuments({ role: "STARTUP" });
        const totalInvestors = await User.countDocuments({ role: "INVESTOR" });
        const pendingVerifications = await User.countDocuments({ isVerified: false });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalStartups,
                totalInvestors,
                pendingVerifications,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyUserManual = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body; // true or false

        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified: status, verificationDate: status ? new Date() : null },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            success: true,
            message: `User verification status updated to ${status}`,
            user
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getVerificationQueue = async (req, res) => {
    try {
        const users = await User.find({ isVerified: false }).select("name email phone role verificationStatus createdAt");
        res.status(200).json({ success: true, users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
