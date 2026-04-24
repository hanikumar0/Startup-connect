import MarketIntelligence from "../models/MarketIntelligence.js";
import Saved from "../models/Saved.js";
import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import SearchCache from "../models/SearchCache.js";
import { scrapeEventbriteBrowser } from "../intelligence/events.scraper.js";
import { scrapeMeetupEvents } from "../scrapers/meetup.scraper.js";

/**
 * Smart Search with Cache: Meetup + Eventbrite + DB
 */
export const searchIntelligence = async (req, res) => {
    try {
        const { q, type = "all" } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Search query required" });

        const normalizedQ = q.toLowerCase().trim();
        const cacheKey = normalizedQ;

        // 1. Check Cache
        let cache = await SearchCache.findOne({ normalizedKeyword: cacheKey }).populate('results');
        
        let results = [];
        let status = "fresh";

        if (cache && cache.expiresAt > new Date()) {
            // Hot cache hit
            console.log(`[Cache] Hit for: ${q}`);
            results = cache.results;
            cache.hitCount++;
            cache.lastUsedAt = new Date();
            await cache.save();
        } else {
            // 2. Cache Miss or Stale -> Live Fetch
            console.log(`[Cache] Miss/Stale for: ${q}. Triggering live fetch...`);
            status = cache ? "stale-refreshing" : "live-fetching";
            
            // Return stale if exists while refreshing in background (optional, for now synchronous for simplicity)
            const [ebResults, meetupResults] = await Promise.all([
                scrapeEventbriteBrowser(normalizedQ).catch(() => []),
                scrapeMeetupEvents(normalizedQ).catch(() => [])
            ]);

            const mergedResults = [...ebResults, ...meetupResults];
            const uniqueResults = Array.from(new Map(mergedResults.map(r => [r.sourceUrl, r])).values());
            
            results = uniqueResults;
            const resultIds = results.map(r => r._id);

            // 3. Update/Create Cache
            const expiryHours = results.length > 20 ? 12 : 24; 
            const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

            await SearchCache.findOneAndUpdate(
                { normalizedKeyword: cacheKey },
                {
                    keyword: q,
                    normalizedKeyword: cacheKey,
                    results: resultIds,
                    sourceSummary: {
                        eventbrite: ebResults.length,
                        meetup: meetupResults.length
                    },
                    expiresAt,
                    lastUsedAt: new Date()
                },
                { upsert: true }
            );
        }

        // 4. Merge with existing DB results (that might already match the regex)
        const dbMatches = await MarketIntelligence.find({
            status: "active",
            $or: [
                { title: { $regex: q, $options: "i" } },
                { tags: { $in: [new RegExp(q, "i")] } }
            ],
            _id: { $nin: results.map(r => r._id) } // Don't repeat
        }).limit(20);

        const finalMerged = [...results, ...dbMatches].sort((a, b) => {
            // Sort by upcoming date if available, then by recency
            const dateA = a.eventDate ? new Date(a.eventDate) : new Date(0);
            const dateB = b.eventDate ? new Date(b.eventDate) : new Date(0);
            return dateA - dateB;
        });

        res.status(200).json({
            success: true,
            status,
            count: finalMerged.length,
            data: finalMerged
        });

    } catch (error) {
        console.error(`[Search] Error: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getIntelligence = async (req, res) => {
    try {
        const { type, category, q, page = 1, limit = 10 } = req.query;
        let query = { status: "active" };

        if (type && type !== "all") query.type = type;
        if (category && category !== "all") query.category = category;
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: "i" } },
                { summary: { $regex: q, $options: "i" } },
                { tags: { $in: [new RegExp(q, "i")] } }
            ];
        }

        const items = await MarketIntelligence.find(query)
            .sort({ date: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await MarketIntelligence.countDocuments(query);
        console.log(`[API] getIntelligence: type=${type || 'all'} | Found: ${items.length} / ${total}`);

        res.status(200).json({
            success: true,
            data: items,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getPersonalizedIntelligence = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        let userProfile;

        if (user.role === "startup") {
            userProfile = await Startup.findOne({ userId });
        } else {
            userProfile = await Investor.findOne({ userId });
        }

        // Base query for personalized items
        let query = { status: "active" };
        
        // Priority to user's industry/focus
        const userInterests = user.role === "startup" 
            ? [userProfile?.industry] 
            : userProfile?.preferredIndustries;

        const filteredInterests = userInterests?.filter(i => !!i) || [];

        if (filteredInterests.length > 0) {
            query.$or = [
                { category: { $in: filteredInterests } },
                { tags: { $in: filteredInterests } },
                { targetAudience: { $in: [user.role, "all"] } }
            ];
        } else {
            query.targetAudience = { $in: [user.role, "all"] };
        }

        const items = await MarketIntelligence.find(query)
            .sort({ date: -1 })
            .limit(10);

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getTrendingSectors = async (req, res) => {
    try {
        const sectors = await MarketIntelligence.aggregate([
            { $match: { status: "active", category: { $exists: true, $ne: null } } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 }
        ]);
        res.status(200).json({ success: true, data: sectors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const saveIntelligence = async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.id;

        const item = await MarketIntelligence.findById(itemId);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        const saved = await Saved.findOneAndUpdate(
            { userId, targetId: itemId, targetType: "intelligence" },
            { 
                userId, 
                targetId: itemId, 
                targetType: "intelligence",
                title: item.title,
                description: item.summary
            },
            { upsert: true, new: true }
        );

        res.status(200).json({ success: true, data: saved });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const unsaveIntelligence = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        await Saved.findOneAndDelete({ userId, targetId: itemId, targetType: "intelligence" });

        res.status(200).json({ success: true, message: "Item unsaved" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSavedIntelligence = async (req, res) => {
    try {
        const userId = req.user.id;
        const savedItems = await Saved.find({ userId, targetType: "intelligence" });
        const itemIds = savedItems.map(s => s.targetId);
        
        const items = await MarketIntelligence.find({ _id: { $in: itemIds } });
        
        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getIntelligenceCounts = async (req, res) => {
    try {
        const counts = await MarketIntelligence.aggregate([
            { $match: { status: "active" } },
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        
        const countsMap = counts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.status(200).json({ success: true, data: countsMap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
