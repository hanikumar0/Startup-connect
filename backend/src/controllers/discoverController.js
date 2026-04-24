import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Saved from "../models/Saved.js";
import Match from "../models/Match.js";

// @desc    Discover startups with filters, search and pagination
// @route   GET /api/discover/startups
export const discoverStartups = async (req, res) => {
    try {
        const userRole = req.user?.role?.toLowerCase() || "startup";
        if (userRole === "startup") {
            console.log(`[Discovery] Role: startup | Blocked access to startups list`);
            return res.status(200).json({ success: true, total: 0, page: 1, pages: 0, data: [] });
        }

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

        let sortQuery = { isFeatured: -1, boostUntil: -1, fundingScore: -1, visibilityScore: -1, profileScore: -1, createdAt: -1 };
        if (sort === "funding-desc") sortQuery = { isFeatured: -1, boostUntil: -1, fundingRequired: -1 };
        if (sort === "funding-asc") sortQuery = { isFeatured: -1, boostUntil: -1, fundingRequired: 1 };
        if (sort === "newest" || sort === "new-users") sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        if (sort === "recently-active") sortQuery = { isFeatured: -1, boostUntil: -1, updatedAt: -1 };
        if (sort === "trending") sortQuery = { isFeatured: -1, boostUntil: -1, visibilityScore: -1, githubStars: -1, createdAt: -1 };

        const skip = (page - 1) * limit;
        const total = await Startup.countDocuments(query);
        const startups = await Startup.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit))
            .populate("userId", "name avatar");

        // Attach Fit Scores
        let investorProfile = null;
        if (userRole === "investor") {
            investorProfile = await Investor.findOne({ userId: req.user.id });
        }

        const startupsWithScores = await Promise.all(startups.map(async (st) => {
            let fitScore = null;
            if (investorProfile) {
                const match = await Match.findOne({ startupId: st._id, investorId: investorProfile._id });
                fitScore = match ? match.score : null;
            }
            return { ...st._doc, fitScore };
        }));

        // Sort by Fit Score if investorProfile exists and user didn't specify other sort
        if (investorProfile && !sort) {
            startupsWithScores.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
        }

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: startupsWithScores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Discover investors with filters, search and pagination
// @route   GET /api/discover/investors
export const discoverInvestors = async (req, res) => {
    try {
        const userRole = req.user?.role?.toLowerCase() || "startup";
        const currentUserId = req.user.id;
        
        if (userRole === "investor") {
            console.log(`[Discovery] Role: investor | Blocked access to investors list`);
            return res.status(200).json({ success: true, total: 0, page: 1, pages: 0, data: [] });
        }

        let startupProfile = null;
        if (userRole === "startup") {
            startupProfile = await Startup.findOne({ userId: currentUserId });
        }

        const { industry, type, stage, location, q, sort, page = 1, limit = 8 } = req.query;
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

        let sortQuery = { isFeatured: -1, boostUntil: -1, visibilityScore: -1, profileScore: -1, createdAt: -1 };
        if (sort === "newest" || sort === "new-users") sortQuery = { isFeatured: -1, boostUntil: -1, createdAt: -1 };
        if (sort === "recently-active") sortQuery = { isFeatured: -1, boostUntil: -1, updatedAt: -1 };
        const skip = (page - 1) * limit;
        const total = await Investor.countDocuments(query);
        const investors = await Investor.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit))
            .populate("userId", "name avatar");

        // Attach Fit Scores
        const investorsWithScores = await Promise.all(investors.map(async (inv) => {
            let fitScore = null;
            if (startupProfile) {
                const match = await Match.findOne({ startupId: startupProfile._id, investorId: inv._id });
                fitScore = match ? match.score : null;
            }
            return { ...inv._doc, fitScore };
        }));

        // Sort by Fit Score if startupProfile exists and user didn't specify other sort
        if (startupProfile && !sort) {
            investorsWithScores.sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0));
        }

        res.status(200).json({
            success: true,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: investorsWithScores
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    External discovery master aggregator (supports federated fetching from scraper, API, CSV)
export const discoverExternal = async (req, res) => {
    try {
        const { industry, location, q, source, page = 1, limit = 50 } = req.query; // Higher limit for reliability
        const ExternalProfile = (await import("../models/ExternalProfile.js")).default;
        
        const userRole = req.user?.role?.toLowerCase() || "startup";
        const targetType = userRole === "startup" ? "investor" : "startup";
        
        console.log(`[Discovery] Role: ${userRole}`);
        console.log(`[Discovery] Filter applied: ${targetType}s only`);

        // 1. Initial Inclusive Fetch
        let query = { type: targetType };
        const hasFilters = industry || location || q || source;

        if (hasFilters) {
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
        }

        // STEP 1 — GET TOTAL FROM DATABASE
        const totalCount = await ExternalProfile.countDocuments(query);
        
        const skip = (page - 1) * limit;
        const allFetched = await ExternalProfile.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean();

        console.log(`\n================================`);
        console.log(`🔍 DATABASE FETCH CHECK`);
        console.log(`- Request User Role: ${userRole}`);
        console.log(`- Total DB Records: ${totalCount}`);
        console.log(`- Records Fetched (Page ${page}): ${allFetched.length}`);
        console.log(`================================`);

        if (allFetched.length === 0) {
            console.warn("⚠️ [External Discovery] Database query returned empty array!");
        }

        // STEP 2 — APPLY ROLE-BASED FILTERING (Institutional Logic)
        // We ensure we send both, but the frontend will filter based on user role
        const finalData = allFetched;
        
        const phCount = finalData.filter(x => x.source === 'producthunt').length;
        const ghCount = finalData.filter(x => x.source === 'github').length;
        const csvCount = finalData.filter(x => x.source === 'csv' || x.source === 'investors_raw').length;

        console.log("🧩 BACKEND PROCESSING CHECK:");
        console.log(`- Product Hunt:       ${phCount}`);
        console.log(`- GitHub:             ${ghCount}`);
        console.log(`- CSV Investors:      ${csvCount}`);
        console.log(`- Final Payload Size: ${finalData.length}`);
        console.log("------------------------------------------\n");

        // PART 2: Categorized Response
        const startups = finalData.filter(x => x.type?.toLowerCase() === "startup");
        const investors = finalData.filter(x => x.type?.toLowerCase() === "investor");

        // STEP 4 — SEND RESPONSE (No mock data)
        res.status(200).json({
            success: true,
            audit: {
                db_total: totalCount,
                fetched: finalData.length,
                rendered_suggestion: finalData.length
            },
            startups,
            investors,
            data: finalData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Fetch only registered users for Smart Match baseline
export const getRegisteredUsers = async (req, res) => {
    try {
        const { type, q } = req.query; // investor or startup
        
        const searchRegex = q ? { $regex: q, $options: "i" } : null;
        let query = { isPublic: true, userId: { $exists: true, $ne: null } };

        if (searchRegex) {
            if (type === "investor") {
                query.$or = [
                    { investorName: searchRegex },
                    { firmName: searchRegex },
                    { investmentThesis: searchRegex }
                ];
            } else {
                query.$or = [
                    { startupName: searchRegex },
                    { description: searchRegex },
                    { industry: searchRegex }
                ];
            }
        }

        let profiles;
        if (type === "investor") {
            profiles = await Investor.find(query)
                .populate("userId", "name avatar lastLogin")
                .limit(50);
        } else if (type === "startup") {
            profiles = await Startup.find(query)
                .populate("userId", "name avatar lastLogin")
                .limit(50);
        } else {
            return res.status(400).json({ success: false, message: "Type required: investor/startup" });
        }

        // STEP 5 — SMART MATCH LOG
        if (profiles.length === 0) {
            console.log("No registered matches, falling back to external leads.");
            const targetType = req.user?.role?.toLowerCase() === "startup" ? "investor" : "startup";
            const ExternalProfile = (await import("../models/ExternalProfile.js")).default;
            const fallback = await ExternalProfile.find({ type: targetType })
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();
            
            // Map external to match registry structure for frontend compatibility
            const mappedFallback = fallback.map(item => ({
                ...item,
                isExternalLead: true, // Marker for UI
                role: item.type, // Map type to role for frontend filter consistency
                name: item.name,
                firmName: item.firm,
                industry: item.industry || "Technology",
                location: item.location || "Global"
            }));

            console.log("Smart matches sent (Fallback):", mappedFallback.length);

            return res.status(200).json({
                success: true,
                count: mappedFallback.length,
                data: mappedFallback,
                isFallback: true
            });
        }

        console.log("Smart matches sent:", profiles.length);

        res.status(200).json({
            success: true,
            count: profiles.length,
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

export const searchInternal = async (req, res) => {
    try {
        const { q, industry, stage, location } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Search query required" });

        const userRole = req.user?.role?.toLowerCase() || "startup";
        const targetType = userRole === "startup" ? "investor" : "startup";
        
        const searchRegex = { $regex: q, $options: "i" };
        let query = { isPublic: true, userId: { $exists: true, $ne: null } };

        if (targetType === "investor") {
            query.$or = [
                { investorName: searchRegex },
                { firmName: searchRegex },
                { investmentThesis: searchRegex }
            ];
            if (industry && industry !== "All") query.preferredIndustries = { $in: [new RegExp(industry, "i")] };
            if (stage && stage !== "All") query.preferredStages = { $in: [stage] };
        } else {
            query.$or = [
                { startupName: searchRegex },
                { description: searchRegex },
                { industry: searchRegex }
            ];
            if (industry && industry !== "All") query.industry = industry;
            if (stage && stage !== "All") query.stage = stage;
        }

        if (location) query.location = { $regex: location, $options: "i" };

        let profiles;
        if (targetType === "investor") {
            profiles = await Investor.find(query).populate("userId", "name avatar");
        } else {
            profiles = await Startup.find(query).populate("userId", "name avatar");
        }

        res.status(200).json({ success: true, data: profiles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const searchGlobal = async (req, res) => {
    try {
        const { q, industry, location } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Search query required" });

        const userRole = req.user?.role?.toLowerCase() || "startup";
        const targetType = userRole === "startup" ? "investor" : "startup";
        
        const ExternalProfile = (await import("../models/ExternalProfile.js")).default;
        let query = {
            type: targetType,
            $or: [
                { name: { $regex: q, $options: "i" } },
                { firm: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } }
            ]
        };

        if (industry && industry !== "All" && industry !== "All Industries") {
            query.industry = { $regex: industry, $options: "i" };
        }
        if (location) query.location = { $regex: location, $options: "i" };

        const results = await ExternalProfile.find(query).limit(50);
        res.status(200).json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const globalSearch = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Search query required" });

        const userRole = req.user?.role?.toLowerCase() || "startup";
        const targetType = userRole === "startup" ? "investor" : "startup";
        const ExternalProfile = (await import("../models/ExternalProfile.js")).default;
        const searchRegex = { $regex: q, $options: "i" };
        
        // 1. Fetch Internal Results (Role prioritized and filtered)
        let internalResults = [];
        if (targetType === "investor") {
            internalResults = await Investor.find({ isPublic: true, $or: [{ investorName: searchRegex }, { firmName: searchRegex }] }).limit(20).populate("userId", "name avatar");
        } else {
            internalResults = await Startup.find({ isPublic: true, $or: [{ startupName: searchRegex }, { industry: searchRegex }] }).limit(20).populate("userId", "name avatar");
        }

        // 2. Fetch External (Scraped) Results (Strict Filtering)
        const external = await ExternalProfile.find({
            type: targetType,
            $or: [
                { name: searchRegex },
                { firm: searchRegex },
                { description: searchRegex }
            ]
        }).limit(20);

        // 3. Fetch Market Intelligence (News, Events, Grants)
        const MarketIntelligence = (await import("../models/MarketIntelligence.js")).default;
        const intelligence = await MarketIntelligence.find({
            status: "active",
            $or: [
                { title: searchRegex },
                { summary: searchRegex },
                { tags: { $in: [new RegExp(q, "i")] } }
            ]
        }).limit(15);

        res.status(200).json({
            success: true,
            data: {
                internal: {
                    prioritized: internalResults,
                    [targetType + "s"]: internalResults
                },
                external: external,
                intelligence: intelligence
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

