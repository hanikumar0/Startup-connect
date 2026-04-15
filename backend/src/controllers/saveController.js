import Saved from "../models/Saved.js";
import Watchlist from "../models/Watchlist.js";
import RecentlyViewed from "../models/RecentlyViewed.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Meeting from "../models/Meeting.js";

// --- SAVE / BOOKMARK LOGIC ---

// @desc    Toggle Save/Unsave
// @route   POST /api/save
export const toggleSave = async (req, res) => {
    try {
        const { targetId, targetType, title, description } = req.body;
        const userId = req.user.id;

        const existing = await Saved.findOne({ userId, targetId });

        if (existing) {
            await Saved.findByIdAndDelete(existing._id);
            return res.status(200).json({ success: true, saved: false, message: "Item removed from collection." });
        }

        await Saved.create({ userId, targetId, targetType, title: title || "", description: description || "" });
        res.status(201).json({ success: true, saved: true, message: "Item secured in collection." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete saved item by save record ID
// @route   DELETE /api/save/:id
export const deleteSavedItem = async (req, res) => {
    try {
        const item = await Saved.findOne({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).json({ success: false, message: "Saved item not found." });

        await Saved.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Item removed from saved collection." });
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

// @desc    Toggle Pinned
// @route   PUT /api/save/:id/pin
export const togglePin = async (req, res) => {
    try {
        const item = await Saved.findOne({ _id: req.params.id, userId: req.user.id });
        if (!item) return res.status(404).json({ message: "Saved item not found." });

        item.isPinned = !item.isPinned;
        await item.save();

        res.status(200).json({ success: true, isPinned: item.isPinned });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all saved items (with search, filter, sort)
// @route   GET /api/save
export const getSavedItems = async (req, res) => {
    try {
        const { type, isFavorite, search, sort = "recent", page = 1, limit = 20 } = req.query;
        let query = { userId: req.user.id };
        if (type && type !== "all") query.targetType = type;
        if (isFavorite === "true") query.isFavorite = true;

        // Sort logic
        let sortObj = { isPinned: -1, createdAt: -1 }; // default: recent
        if (sort === "oldest") sortObj = { isPinned: -1, createdAt: 1 };
        if (sort === "pinned") sortObj = { isPinned: -1, isFavorite: -1, createdAt: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const saved = await Saved.find(query).sort(sortObj).skip(skip).limit(parseInt(limit));
        const total = await Saved.countDocuments(query);

        // Populate details based on type
        const populated = await Promise.all(
            saved.map(async (item) => {
                try {
                    let details = null;
                    if (item.targetType === "startup") {
                        details = await Startup.findById(item.targetId).select(
                            "name startupName industry location logo bio description website stage fundingStage"
                        );
                    } else if (item.targetType === "investor") {
                        details = await Investor.findById(item.targetId).select(
                            "name investorName firm industry location logo bio description website investmentFocus"
                        );
                    } else if (item.targetType === "meeting") {
                        details = await Meeting.findById(item.targetId).select(
                            "title agenda scheduledAt status platform participants"
                        );
                    }

                    // If entity was deleted, fall back to snapshot
                    if (!details) {
                        details = { name: item.title || "Deleted Item", bio: item.description || "" };
                    }

                    return { ...item._doc, details };
                } catch {
                    return { ...item._doc, details: { name: item.title || "Unknown", bio: "" } };
                }
            })
        );

        // Client-side search after populate (since fields are on nested details)
        let results = populated;
        if (search && search.trim()) {
            const q = search.toLowerCase();
            results = populated.filter((item) => {
                const name = (
                    item.details?.startupName ||
                    item.details?.name ||
                    item.details?.investorName ||
                    item.details?.title ||
                    item.title ||
                    ""
                ).toLowerCase();
                const bio = (item.details?.bio || item.details?.description || item.description || "").toLowerCase();
                const industry = (item.details?.industry || "").toLowerCase();
                const tags = (item.tags || []).join(" ").toLowerCase();
                return name.includes(q) || bio.includes(q) || industry.includes(q) || tags.includes(q);
            });
        }

        res.status(200).json({ success: true, data: results, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Export saved items as JSON (CSV/PDF handled on frontend)
// @route   GET /api/save/export
export const exportSavedItems = async (req, res) => {
    try {
        const saved = await Saved.find({ userId: req.user.id }).sort({ createdAt: -1 });

        const populated = await Promise.all(
            saved.map(async (item) => {
                let details = null;
                if (item.targetType === "startup") {
                    details = await Startup.findById(item.targetId).select("name startupName industry location");
                } else if (item.targetType === "investor") {
                    details = await Investor.findById(item.targetId).select("name investorName firm industry location");
                }
                const name = details?.startupName || details?.investorName || details?.name || item.title || "Unknown";
                return {
                    id: item._id,
                    name,
                    type: item.targetType,
                    industry: details?.industry || "",
                    location: details?.location || "",
                    pinned: item.isPinned,
                    favorite: item.isFavorite,
                    savedAt: item.createdAt,
                };
            })
        );

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get saved count by type (for stats)
// @route   GET /api/save/stats
export const getSavedStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const [total, startups, investors, meetings, pinned, favorites] = await Promise.all([
            Saved.countDocuments({ userId }),
            Saved.countDocuments({ userId, targetType: "startup" }),
            Saved.countDocuments({ userId, targetType: "investor" }),
            Saved.countDocuments({ userId, targetType: "meeting" }),
            Saved.countDocuments({ userId, isPinned: true }),
            Saved.countDocuments({ userId, isFavorite: true }),
        ]);
        res.status(200).json({ success: true, stats: { total, startups, investors, meetings, pinned, favorites } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- WATCHLIST LOGIC ---

// @desc    Create Watchlist
// @route   POST /api/save/watchlist
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
// @route   GET /api/save/watchlist
export const getWatchlists = async (req, res) => {
    try {
        const watchlists = await Watchlist.find({ userId: req.user.id });
        res.status(200).json({ success: true, data: watchlists });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add to Watchlist
// @route   POST /api/save/watchlist/:id/add
export const addToWatchlist = async (req, res) => {
    try {
        const { targetId, targetType } = req.body;
        const wl = await Watchlist.findOne({ _id: req.params.id, userId: req.user.id });
        if (!wl) return res.status(404).json({ message: "Watchlist not found" });

        const exists = wl.items.some((i) => i.targetId.toString() === targetId);
        if (exists) return res.status(400).json({ message: "Item already in watchlist" });

        wl.items.push({ targetId, targetType });
        await wl.save();

        res.status(200).json({ success: true, data: wl });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- RECENTLY VIEWED ---

// @desc    Track recently viewed
// @route   POST /api/save/recent
export const trackRecent = async (req, res) => {
    try {
        const { targetId, targetType } = req.body;
        const userId = req.user.id;

        await RecentlyViewed.findOneAndDelete({ userId, targetId });
        await RecentlyViewed.create({ userId, targetId, targetType });

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
// @route   GET /api/save/recent
export const getRecentItems = async (req, res) => {
    try {
        const recent = await RecentlyViewed.find({ userId: req.user.id }).sort({ viewedAt: -1 }).limit(10);

        const populated = await Promise.all(
            recent.map(async (item) => {
                try {
                    const Model = item.targetType === "startup" ? Startup : Investor;
                    const details = await Model.findById(item.targetId).select(
                        "name startupName investorName industry location logo bio"
                    );
                    return { ...item._doc, details };
                } catch {
                    return { ...item._doc, details: null };
                }
            })
        );

        res.status(200).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
