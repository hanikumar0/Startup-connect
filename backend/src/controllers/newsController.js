import MarketIntelligence from "../models/MarketIntelligence.js";

// @desc    Get all active news with filters and pagination
export const getNews = async (req, res) => {
    try {
        const { category, q, page = 1, limit = 10 } = req.query;
        let query = { type: "news", status: "active" };

        if (category) query.category = category;
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { summary: { $regex: q, $options: "i" } },
                { tags: { $in: [new RegExp(q, "i")] } }
            ];
        }

        const skip = (page - 1) * limit;
        const total = await MarketIntelligence.countDocuments(query);
        const news = await MarketIntelligence.find(query)
            .sort({ publishedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: news
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get trending news topics based on category counts
export const getTrendingNews = async (req, res) => {
    try {
        const stats = await MarketIntelligence.aggregate([
            { $match: { type: "news", status: "active" } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get latest breaking news
export const getLatestNews = async (req, res) => {
    try {
        const news = await MarketIntelligence.find({ type: "news", status: "active" })
            .sort({ publishedAt: -1 })
            .limit(5);
        res.status(200).json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
