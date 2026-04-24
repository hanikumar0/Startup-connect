import Startup from "../models/Startup.js";
import User from "../models/User.js";
import { calculateReadinessScore } from "../services/fundingScoreService.js";

// @desc    Create a new startup profile
// @route   POST /api/startup/create
export const createStartup = async (req, res) => {
    try {
        const userId = req.user.id;
        const startupExists = await Startup.findOne({ userId });
        if (startupExists) {
            return res.status(400).json({ success: false, message: "Startup profile already exists for this user" });
        }

        const startup = await Startup.create({
            ...req.body,
            userId,
        });

        await User.findByIdAndUpdate(userId, { onboardingCompleted: true });
        
        // Trigger Score Calculation
        try {
            await calculateReadinessScore(startup._id);
        } catch (err) {
            console.error("Auto calculation failed on creation", err);
        }

        res.status(201).json({ success: true, data: startup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current user's startup profile
// @route   GET /api/startup/me
export const getMyStartup = async (req, res) => {
    try {
        const startup = await Startup.findOne({ userId: req.user.id });
        if (!startup) {
            return res.status(404).json({ success: false, message: "Startup profile not found" });
        }
        res.status(200).json({ success: true, data: startup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update startup profile
// @route   PUT /api/startup/update
export const updateStartup = async (req, res) => {
    try {
        const startup = await Startup.findOneAndUpdate(
            { userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!startup) {
            return res.status(404).json({ success: false, message: "Startup profile not found" });
        }
        res.status(200).json({ success: true, data: startup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get startup by ID
// @route   GET /api/startup/:id
export const getStartupById = async (req, res) => {
    try {
        const startup = await Startup.findById(req.params.id).populate("userId", "name email avatar");
        if (!startup) {
            return res.status(404).json({ success: false, message: "Startup not found" });
        }
        res.status(200).json({ success: true, data: startup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all startups
// @route   GET /api/startup/all
export const getAllStartups = async (req, res) => {
    try {
        const startups = await Startup.find({ isPublic: true }).sort("-createdAt");
        res.status(200).json({ success: true, data: startups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload logo
// @route   POST /api/startup/upload-logo
export const uploadLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // With Cloudinary multer-storage, URL is in req.file.path
        res.status(200).json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Upload pitch deck
// @route   POST /api/startup/upload-pitch
export const uploadPitch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        // With Cloudinary multer-storage, URL is in req.file.path
        res.status(200).json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
