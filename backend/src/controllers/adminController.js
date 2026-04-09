import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Report from "../models/Report.js";
import Subscription from "../models/Subscription.js";
import Meeting from "../models/Meeting.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import { importFromProductHunt } from "../scrapers/producthunt.js";
import { importFromGitHub } from "../scrapers/github.js";
import { importFromHackerNews } from "../scrapers/hackernews.js";
import { importFromOpenVC } from "../scrapers/openvc.js";
import { importFromApify } from "../scrapers/apify.js";
import enrichmentService from "../services/enrichmentService.js";

// @desc    Get detailed platform analytics & dashboard summary
// @route   GET /api/admin/stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ status: "active" });
        const totalStartups = await Startup.countDocuments();
        const totalInvestors = await Investor.countDocuments();
        
        const totalMeetings = await Meeting.countDocuments();
        const totalMessages = await Message.countDocuments();
        const totalSubscriptions = await Subscription.countDocuments();
        const activeReports = await Report.countDocuments({ status: "pending" });

        const recentUsers = await User.find()
            .select("name email role createdAt status")
            .sort({ createdAt: -1 })
            .limit(10);

        const recentStartups = await Startup.find()
            .select("startupName industry status createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        const recentInvestors = await Investor.find()
            .select("investorName investorType status createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        // Growth metrics (last 30 days) - Mock for now
        const analytics = {
            usersGrowth: [
                { date: 'Mar 1', count: 120 },
                { date: 'Mar 15', count: 450 },
                { date: 'Apr 1', count: 890 },
                { date: 'Apr 7', count: totalUsers },
            ],
            messagesVolume: [
                { date: 'Mar 1', count: 500 },
                { date: 'Mar 15', count: 1200 },
                { date: 'Apr 1', count: 2800 },
                { date: 'Apr 7', count: totalMessages },
            ],
            meetingsScheduled: [
                { date: 'Mar 1', count: 10 },
                { date: 'Mar 15', count: 45 },
                { date: 'Apr 1', count: 120 },
                { date: 'Apr 7', count: totalMeetings },
            ]
        };

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                activeUsersCount,
                totalStartups,
                totalInvestors,
                totalMeetings,
                totalMessages,
                totalSubscriptions,
                activeReports,
                recentUsers,
                recentStartups,
                recentInvestors,
                analytics
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- USER MANAGEMENT ---

// @desc    Get all users with advanced filtering
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const { role, status, search, page = 1, limit = 20 } = req.query;
        let query = {};
        
        if (role) query.role = role.toLowerCase();
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.status(200).json({ 
            success: true, 
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user status (block/unblock)
// @route   PUT /api/admin/user/:id/status
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body; // active or blocked
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, message: `User is now ${status}`, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify user
// @route   PUT /api/admin/user/:id/verify
export const verifyUserManual = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Permanently delete a user account
// @route   DELETE /api/admin/user/:id
export const handleUserDelete = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Clean up related notifications
        await Notification.deleteMany({ $or: [{ recipient: req.params.id }, { sender: req.params.id }] });

        res.status(200).json({ success: true, message: `User ${user.name} permanently deleted` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- STARTUP MODERATION ---

// @desc    Get startups with moderation filters
// @route   GET /api/admin/startups
export const getStartups = async (req, res) => {
    try {
        const { status, featured } = req.query;
        let query = {};
        if (status) query.status = status;
        if (featured) query.isFeatured = featured === 'true';

        const startups = await Startup.find(query).populate("userId", "name email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: startups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Reject startup profile
// @route   PUT /api/admin/startup/:id/status
export const moderateStartup = async (req, res) => {
    try {
        const { status, isFeatured, isVerified } = req.body;
        const startup = await Startup.findByIdAndUpdate(
            req.params.id,
            { status, isFeatured, isVerified },
            { new: true }
        );
        if (!startup) return res.status(404).json({ success: false, message: "Startup not found" });

        // Logic for notifications
        if (status === 'approved') {
            await Notification.create({
                recipient: startup.userId,
                type: "SYSTEM",
                title: "Profile Approved!",
                message: "Your startup profile has been approved and is now live."
            });
        }

        res.status(200).json({ success: true, data: startup });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- INVESTOR MODERATION ---

// @desc    Get investors with moderation filters
// @route   GET /api/admin/investors
export const getInvestors = async (req, res) => {
    try {
        const { status, featured } = req.query;
        let query = {};
        if (status) query.status = status;
        if (featured) query.isFeatured = featured === 'true';

        const investors = await Investor.find(query).populate("userId", "name email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: investors });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve/Reject investor profile
// @route   PUT /api/admin/investor/:id/status
export const moderateInvestor = async (req, res) => {
    try {
        const { status, isFeatured, isVerified } = req.body;
        const investor = await Investor.findByIdAndUpdate(
            req.params.id,
            { status, isFeatured, isVerified },
            { new: true }
        );
        if (!investor) return res.status(404).json({ success: false, message: "Investor not found" });

        if (status === 'approved') {
            await Notification.create({
                recipient: investor.userId,
                type: "SYSTEM",
                title: "Profile Approved!",
                message: "Your investor profile has been approved and is now live."
            });
        }

        res.status(200).json({ success: true, data: investor });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- CLAIMS ---

// @desc    Get all claim requests
// @route   GET /api/admin/claims
export const getClaims = async (req, res) => {
    try {
        const startups = await Startup.find({ isClaimed: false, claimedBy: { $exists: true, $ne: null } }).populate("claimedBy", "name email");
        const investors = await Investor.find({ isClaimed: false, claimedBy: { $exists: true, $ne: null } }).populate("claimedBy", "name email");
        
        const combined = [
            ...startups.map(s => ({ ...s._doc, profileType: 'startup' })),
            ...investors.map(i => ({ ...i._doc, profileType: 'investor' }))
        ];

        res.status(200).json({ success: true, data: combined });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- SCRAPERS ---

// @desc    Get scraper logs and status
// @route   GET /api/admin/scrape/logs
export const getScraperLogs = async (req, res) => {
    try {
        // Mock scraper logs
        const logs = [
            { source: 'LinkedIn', date: new Date(), status: 'SUCCESS', found: 154, imported: 12 },
            { source: 'Crunchbase', date: new Date(Date.now() - 86400000), status: 'PARTIAL', found: 89, imported: 5 },
            { source: 'Tracxn', date: new Date(Date.now() - 172800000), status: 'FAILED', error: 'API Timeout' },
        ];
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Manually trigger a specific scraper type
// @route   POST /api/admin/scrape/:type
export const triggerScraper = async (req, res) => {
    try {
        const { type } = req.params;
        let result;

        if (type === 'startups') {
            const ph = await importFromProductHunt();
            const gh = await importFromGitHub();
            const hn = await importFromHackerNews();
            result = { success: true, message: "Startup ingestion complete", ph, gh, hn };
        } else if (type === 'investors') {
            const openvc = await importFromOpenVC();
            const apify = await importFromApify();
            result = { success: true, message: "Investor audit complete", openvc, apify };
        } else {
            return res.status(400).json({ success: false, message: "Invalid scraper type" });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    AI Extract from a specific URL
// @route   POST /api/admin/scrape/url
export const scrapeUrl = async (req, res) => {
    try {
        const { url, type } = req.body; // type: startup or investor
        if (!url) return res.status(400).json({ success: false, message: "URL required" });

        // Institutional AI link prospector logic
        const record = { website: url, source: 'Manual Extraction' };
        const enriched = await enrichmentService.enrichRecord(record, type || 'startup');
        
        // Save to database
        let saved;
        if (type === 'investor') {
            saved = await Investor.create(enriched);
        } else {
            saved = await Startup.create(enriched);
        }

        res.status(200).json({ success: true, message: "Extraction successful", data: saved });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- SUBSCRIPTIONS ---

// @desc    Get subscription list
// @route   GET /api/admin/subscriptions
export const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find().populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: subscriptions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- REPORTS ---

// @desc    Get report list
// @route   GET /api/admin/reports
export const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporter", "name email")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Resolve reported item
// @route   PUT /api/admin/report/:id/resolve
export const resolveReport = async (req, res) => {
    try {
        const { actionTaken, status } = req.body; // status: resolved or dismissed
        const report = await Report.findByIdAndUpdate(
            req.params.id, 
            { status, actionTaken, resolvedBy: req.user.id },
            { new: true }
        );
        if (!report) return res.status(404).json({ success: false, message: "Report not found" });
        res.status(200).json({ success: true, message: "Report resolved", data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
