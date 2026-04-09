import Saved from "../models/Saved.js";
import Watchlist from "../models/Watchlist.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";

// --- SAVE / BOOKMARK LOGIC ---

// @desc    Toggle Save/Unsave 
// @route   POST /api/save
export const toggleSave = async (req, res) => {
    try {
        const { targetId, targetType } = req.body;
        const userId = req.user.id;

        const existing = await Saved.findOne({ userId, targetId });

        if (existing) {
            await Saved.findByIdAndDelete(existing._id);
            return res.status(200).json({ success: true, saved: false, message: "Item removed from collection." });
        }

        await Saved.create({ userId, targetId, targetType });
        res.status(201).json({ success: true, saved: true, message: "Item secured in collection." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Toggle Favorite
// @route   PUT /api/save/:id/favorite
export const toggleFavorite = async (req, res) => {
    try {
        const item = await Saved.findOne({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).json({ message: "Bookmark not found." });

        item.isFavorite = !item.isFavorite;
        await item.save();

        res.status(200).json({ success: true, isFavorite: item.isFavorite });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all saved items
// @route   GET /api/save
export const getSavedItems = async (req, res) => {
    try {
        const { type, isFavorite } = req.query;
        let query = { userId: req.user.id };
        if (type) query.targetType = type;
        if (isFavorite === 'true') query.isFavorite = true;

        const saved = await Saved.find(query).sort({ isFavorite: -1, createdAt: -1 });

        // Populate details based on type
        const populated = await Promise.all(saved.map(async (item) => {
            const Model = item.targetType === 'startup' ? Startup : Investor;
            const details = await Model.findById(item.targetId).select("name startupName investorName industry location logo bio description");
            return { ...item._doc, details };
        }));

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- WATCHLIST LOGIC ---

// @desc    Create Watchlist
// @route   POST /api/watchlist
export const createWatchlist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const wl = await Watchlist.create({ userId: req.user.id, name, description });
        res.status(201).json({ success: true, data: wl });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get Watchlists
// @route   GET /api/watchlist
export const getWatchlists = async (req, res) => {
    try {
        const watchlists = await Watchlist.find({ userId: req.user.id });
        res.status(200).json({ success: true, data: watchlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add to Watchlist
// @route   POST /api/watchlist/:id/add
export const addToWatchlist = async (req, res) => {
    try {
        const { targetId, targetType } = req.body;
        const wl = await Watchlist.findOne({ _id: req.params.id, userId: req.user.id });
        if (!wl) return res.status(404).json({ message: "Watchlist not found" });

        // Check if already in list
        const exists = wl.items.some(i => i.targetId.toString() === targetId);
        if (exists) return res.status(400).json({ message: "Item already in watchlist" });

        wl.items.push({ targetId, targetType });
        await wl.save();

        res.status(200).json({ success: true, data: wl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// --- RECENTLY VIEWED ---

// @desc    Track recently viewed (used by proxy or client)
// @route   POST /api/recent
export const trackRecent = async (req, res) => {
    try {
        const { targetId, targetType } = req.body;
        const userId = req.user.id;

        // Upsert recently viewed
        await RecentlyViewed.findOneAndDelete({ userId, targetId });
        
        await RecentlyViewed.create({ userId, targetId, targetType });

        // Maintain ceiling of 20 items
        const count = await RecentlyViewed.countDocuments({ userId });
        if (count > 20) {
            const oldest = await RecentlyViewed.findOne({ userId }).sort({ viewedAt: 1 });
            if (oldest) await RecentlyViewed.findByIdAndDelete(oldest._id);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get recently viewed
// @route   GET /api/recent
export const getRecentItems = async (req, res) => {
    try {
        const recent = await RecentlyViewed.find({ userId: req.user.id }).sort({ viewedAt: -1 });

        const populated = await Promise.all(recent.map(async (item) => {
            const Model = item.targetType === 'startup' ? Startup : Investor;
            const details = await Model.findById(item.targetId).select("name startupName investorName industry location logo bio");
            return { ...item._doc, details };
        }));

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
