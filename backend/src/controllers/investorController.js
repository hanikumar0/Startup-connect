import Investor from "../models/Investor.js";
import User from "../models/User.js";
import { uploadToS3 } from "../utils/s3.js";

// @desc    Create investor profile
// @route   POST /api/investor/create
export const createInvestor = async (req, res) => {
    try {
        const userId = req.user.id;
        const exists = await Investor.findOne({ userId });
        if (exists) {
            return res.status(400).json({ success: false, message: "Investor profile already exists" });
        }

        const investor = await Investor.create({
            ...req.body,
            userId,
        });

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });

        res.status(201).json({ success: true, data: investor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current investor profile
// @route   GET /api/investor/me
export const getMyInvestor = async (req, res) => {
    try {
        const investor = await Investor.findOne({ userId: req.user.id });
        if (!investor) {
            return res.status(404).json({ success: false, message: "Investor profile not found" });
        }
        res.status(200).json({ success: true, data: investor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update investor profile
// @route   PUT /api/investor/update
export const updateInvestor = async (req, res) => {
    try {
        const investor = await Investor.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!investor) {
            return res.status(404).json({ success: false, message: "Investor profile not found" });
        }
        res.status(200).json({ success: true, data: investor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get investor by ID
// @route   GET /api/investor/:id
export const getInvestorById = async (req, res) => {
    try {
        const investor = await Investor.findById(req.params.id).populate("userId", "name email avatar");
        if (!investor) {
            return res.status(404).json({ success: false, message: "Investor not found" });
        }
        res.status(200).json({ success: true, data: investor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all investors
// @route   GET /api/investor/all
export const getAllInvestors = async (req, res) => {
    try {
        const investors = await Investor.find({ isPublic: true }).sort("-createdAt");
        res.status(200).json({ success: true, data: investors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload logo/avatar
// @route   POST /api/investor/upload-logo
export const uploadInvestorLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const result = await uploadToS3(req.file, "investor-logos");
        res.status(200).json({ success: true, url: result.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
