import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Saved from "../models/Saved.js";

// @desc    Discover startups with filters, search and pagination
// @route   GET /api/discover/startups
export const discoverStartups = async (req, res) => {
    try {
        const { industry, stage, location, minFunding, maxFunding, q, sort, page = 1, limit = 12 } = req.query;
        let query = { isPublic: true };

        if (industry && industry !== "All") query.industry = industry;
        if (stage && stage !== "All") query.stage = stage;
        if (location) query.location = { $regex: location, $options: "i" };
        if (minFunding || maxFunding) {
            query.fundingRequired = {};
            if (minFunding) query.fundingRequired.$gte = Number(minFunding);
            if (maxFunding) query.fundingRequired.$lte = Number(maxFunding);
        }
        if (q) {
            query.$or = [
                { startupName: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
                { tags: { $in: [new RegExp(q, "i")] } }
            ];
        }

        let sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        if (sort === "funding-desc") sortQuery = { isFeatured: -1, boostUntil: -1, fundingRequired: -1 };
        if (sort === "funding-asc") sortQuery = { isFeatured: -1, boostUntil: -1, fundingRequired: 1 };
        if (sort === "newest") sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        if (sort === "trending") sortQuery = { isFeatured: -1, boostUntil: -1, githubStars: -1, createdAt: -1 };

        const skip = (page - 1) * limit;
        const total = await Startup.countDocuments(query);
        const startups = await Startup.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit))
            .populate("userId", "name avatar");

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: startups
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Discover investors with filters, search and pagination
// @route   GET /api/discover/investors
export const discoverInvestors = async (req, res) => {
    try {
        const { type, industry, stage, location, q, sort, page = 1, limit = 12 } = req.query;
        let query = { isPublic: true };

        if (type && type !== "All") query.investorType = type;
        if (industry && industry !== "All") query.preferredIndustries = { $in: [new RegExp(industry, "i")] };
        if (stage && stage !== "All") query.preferredStages = { $in: [stage] };
        if (location) query.location = { $regex: location, $options: "i" };
        if (q) {
            query.$or = [
                { investorName: { $regex: q, $options: "i" } },
                { firmName: { $regex: q, $options: "i" } },
                { investmentThesis: { $regex: q, $options: "i" } }
            ];
        }

        let sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        const skip = (page - 1) * limit;
        const total = await Investor.countDocuments(query);
        const investors = await Investor.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit))
            .populate("userId", "name avatar");

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: investors
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Global search
// @route   GET /api/search
export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Search query required" });

        const searchRegex = { $regex: q, $options: "i" };
        
        const [startups, investors] = await Promise.all([
            Startup.find({ isPublic: true, $or: [{ startupName: searchRegex }, { industry: searchRegex }] }).limit(5),
            Investor.find({ isPublic: true, $or: [{ investorName: searchRegex }, { firmName: searchRegex }] }).limit(5)
        ]);

        res.status(200).json({
            success: true,
            data: { startups, investors }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
