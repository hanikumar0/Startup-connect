import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Saved from "../models/Saved.js";

// @desc    Discover startups with filters, search and pagination
// @route   GET /api/discover/startups
export const discoverStartups = async (req, res) => {
    try {
        const { industry, stage, location, minFunding, maxFunding, q, sort, page = 1, limit = 8 } = req.query;
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
        if (sort === "newest" || sort === "new-users") sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        if (sort === "recently-active") sortQuery = { isFeatured: -1, boostUntil: -1, updatedAt: -1 };
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
        const { type, industry, stage, location, q, sort, page = 1, limit = 8 } = req.query;
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
        if (sort === "newest" || sort === "new-users") sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        if (sort === "recently-active") sortQuery = { isFeatured: -1, boostUntil: -1, updatedAt: -1 };
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

// @desc    External discovery master aggregator (supports federated fetching from scraper, API, CSV)
export const discoverExternal = async (req, res) => {
    try {
        const { industry, location, q, source, page = 1, limit = 8 } = req.query;
        const ExternalProfile = (await import("../models/ExternalProfile.js")).default;
        
        // FIX: Strict role-based filtering (Opposite role only)
        // If logged in user is a startup, they only see external investors.
        // If logged in user is an investor, they only see external startups.
        const userRole = req.user?.role?.toLowerCase() || "startup";
        const targetType = userRole === "startup" ? "investor" : "startup";
        
        const allCount = await ExternalProfile.countDocuments({});
        
        console.log("Total:", allCount);
        console.log("Target:", targetType);

        let query = { 
            $or: [
                { type: targetType },
                { leadType: targetType },
                { role: targetType }
            ]
        };

        // For startups, we specifically include archival sources in the primary filter
        if (targetType === "investor") {
            query.$or.push({ source: "investors_raw" });
            query.$or.push({ source: "csv" });
        }

        const hasFilters = industry || location || q || source;
        if (industry && industry !== "All" && industry !== "All Industries") {
            query.industry = { $regex: industry, $options: "i" };
        }
        if (location) query.location = { $regex: location, $options: "i" };
        if (source) query.source = source; 

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { firm: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ];
        }

        const skip = (page - 1) * limit;
        let profiles = await ExternalProfile.find(query)
            .sort({ "metadata.stars": -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        let total = await ExternalProfile.countDocuments(query);
        console.log("Filtered:", total);

        let fallbackApplied = false;
        if (profiles.length === 0 && !hasFilters) {
            console.log("Fallback triggered: Returning all archival investors.");
            fallbackApplied = true;
            profiles = await ExternalProfile.find({ source: "investors_raw" })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit));
            
            if (profiles.length === 0) {
                profiles = await ExternalProfile.find({})
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit));
                total = allCount;
            } else {
                total = await ExternalProfile.countDocuments({ source: "investors_raw" });
            }
        }

        const rawCount = await ExternalProfile.countDocuments({ source: "investors_raw" });
        console.log("Source investors_raw:", rawCount);
        console.log("External DB count:", total);

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            targetType: fallbackApplied ? "all" : targetType,
            fallbackStatus: fallbackApplied,
            data: profiles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Fetch only registered users for Smart Match baseline
export const getRegisteredUsers = async (req, res) => {
    try {
        const { type } = req.query; // investor or startup
        
        let profiles;
        if (type === "investor") {
            profiles = await Investor.find({ isPublic: true, userId: { $exists: true, $ne: null } })
                .populate("userId", "name avatar lastLogin")
                .limit(50);
        } else if (type === "startup") {
            profiles = await Startup.find({ isPublic: true, userId: { $exists: true, $ne: null } })
                .populate("userId", "name avatar lastLogin")
                .limit(50);
        } else {
            return res.status(400).json({ success: false, message: "Type required: investor/startup" });
        }

        res.status(200).json({
            success: true,
            data: profiles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getDiscoveryStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const Match = (await import("../models/Match.js")).default;
        const Connection = (await import("../models/Connection.js")).default;
        const Meeting = (await import("../models/Meeting.js")).default;
        const OutreachLog = (await import("../models/OutreachLog.js")).default;

        const [totalMatches, pendingRequests, acceptedConnections, meetingsScheduled, outreachSent, dailyOutreachCount] = await Promise.all([
            Match.countDocuments({ $or: [{ startupId: userId }, { investorId: userId }] }),
            Connection.countDocuments({ recipient: userId, status: "PENDING" }),
            Connection.countDocuments({ $or: [{ sender: userId }, { recipient: userId }], status: "ACCEPTED" }),
            Meeting.countDocuments({ $or: [{ requestedBy: userId }, { recipientId: userId }] }), 
            OutreachLog.countDocuments({ userId }),
            OutreachLog.countDocuments({ 
                userId, 
                createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalMatches,
                connectionRequests: pendingRequests,
                acceptedConnections,
                meetingsScheduled,
                outreachSent,
                dailyOutreachCount,
                dailyLimit: 20 // Standard limit
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

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
