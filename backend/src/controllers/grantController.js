import Grant from "../models/Grant.js";
import User from "../models/User.js";
import Startup from "../models/Startup.js";
import logger from "../config/logger.js";

// ─── Helper: Compute match reasons ────────────────────────────────────────────
function computeMatchReasons(grant, startup) {
    const reasons = [];
    const industry = (startup?.industry || "").toLowerCase();
    const tags = (startup?.tags || []).map(t => t.toLowerCase());
    const stage = (startup?.stage || "").toLowerCase();

    if (grant.sectors?.some(s => s.toLowerCase() === industry)) {
        reasons.push(`Matches your ${startup.industry} sector`);
    }
    if (grant.sectors?.some(s => tags.includes(s.toLowerCase()))) {
        reasons.push("Aligns with your startup tags");
    }
    if (grant.stages?.some(s => s.toLowerCase() === stage)) {
        reasons.push(`${startup.stage}-stage founders eligible`);
    }
    if (grant.country === "India" && startup.location?.toLowerCase().includes("india")) {
        reasons.push("India registered startup fit");
    }
    if (grant.type === "accelerator") {
        reasons.push("Growth accelerator opportunity");
    }
    if (grant.type === "grant") {
        reasons.push("Non-dilutive funding available");
    }
    return reasons.length > 0 ? reasons : ["General startup eligibility"];
}

// ─── Compute match score for ranking ─────────────────────────────────────────
function computeMatchScore(grant, startup) {
    let score = 0;
    const industry = (startup?.industry || "").toLowerCase();
    const tags = (startup?.tags || []).map(t => t.toLowerCase());
    const stage = (startup?.stage || "").toLowerCase();

    if (grant.sectors?.some(s => s.toLowerCase() === industry)) score += 40;
    if (grant.sectors?.some(s => tags.includes(s.toLowerCase()))) score += 20;
    if (grant.stages?.some(s => s.toLowerCase() === stage)) score += 30;
    if (grant.isFeatured) score += 10;
    // Deadline urgency bonus
    if (grant.deadline) {
        const daysLeft = Math.floor((new Date(grant.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0 && daysLeft <= 7) score += 15; // closing soon
        if (daysLeft > 7 && daysLeft <= 30) score += 5;
    }
    return score;
}

// ─── GET /api/grants — All active grants with filters ────────────────────────
export const getGrants = async (req, res) => {
    try {
        const { type, sector, stage, country, search, page = 1, limit = 20 } = req.query;
        const query = { isActive: true };

        if (type) query.type = type;
        if (sector) query.sectors = { $in: [sector] };
        if (stage) query.stages = { $in: [stage] };
        if (country) query.country = country;
        if (search) {
            query.$text = { $search: search };
        }

        // Filter out expired grants
        query.$or = [
            { deadline: { $gte: new Date() } },
            { deadline: null },
            { deadlineText: { $exists: true } }
        ];

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const grants = await Grant.find(query)
            .sort({ isFeatured: -1, deadline: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Grant.countDocuments(query);

        res.json({
            success: true,
            grants,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
        });
    } catch (err) {
        logger.error({ err }, "[Grants] getGrants failed");
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/grants/recommended — Personalized for startup ──────────────────
export const getRecommendedGrants = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const startup = await Startup.findOne({ userId });

        const query = { isActive: true };
        query.$or = [
            { deadline: { $gte: new Date() } },
            { deadline: null },
            { deadlineText: { $exists: true } }
        ];

        const allGrants = await Grant.find(query).limit(100);

        // Score and rank
        const scored = allGrants
            .map(g => ({
                grant: g.toObject(),
                score: computeMatchScore(g, startup),
                matchReasons: computeMatchReasons(g, startup),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 12);

        const recommended = scored.map(({ grant, matchReasons, score }) => ({
            ...grant,
            matchReasons,
            matchScore: score,
        }));

        res.json({ success: true, grants: recommended });
    } catch (err) {
        logger.error({ err }, "[Grants] getRecommendedGrants failed");
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/grants/closing-soon — Deadline in next 14 days ─────────────────
export const getClosingSoon = async (req, res) => {
    try {
        const now = new Date();
        const in14 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        const grants = await Grant.find({
            isActive: true,
            deadline: { $gte: now, $lte: in14 },
        }).sort({ deadline: 1 }).limit(10);

        res.json({ success: true, grants });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/grants/search — Full-text search ───────────────────────────────
export const searchGrants = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, grants: [] });

        const grants = await Grant.find({
            isActive: true,
            $text: { $search: q },
        }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .limit(20);

        res.json({ success: true, grants });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── GET /api/grants/:id — Single grant detail ───────────────────────────────
export const getGrantById = async (req, res) => {
    try {
        const grant = await Grant.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!grant) return res.status(404).json({ success: false, message: "Grant not found" });
        res.json({ success: true, grant });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/grants — Admin: create grant ───────────────────────────────────
export const createGrant = async (req, res) => {
    try {
        const grant = await Grant.create(req.body);
        logger.info({ grantId: grant._id }, "[Grants] New Opportunity Synced");
        res.status(201).json({ success: true, grant });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── PUT /api/grants/:id — Admin: update grant ───────────────────────────────
export const updateGrant = async (req, res) => {
    try {
        const grant = await Grant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!grant) return res.status(404).json({ success: false, message: "Grant not found" });
        res.json({ success: true, grant });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ─── DELETE /api/grants/:id — Admin: delete grant ────────────────────────────
export const deleteGrant = async (req, res) => {
    try {
        await Grant.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Grant removed" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── POST /api/grants/seed — Seed initial grants ─────────────────────────────
export const seedGrants = async (req, res) => {
    try {
        const count = await Grant.countDocuments();
        if (count > 0) {
            return res.json({ success: true, message: `Already seeded (${count} grants exist)` });
        }

        const sampleGrants = [
            {
                title: "Startup India Seed Fund Scheme",
                provider: "Startup India / DPIIT",
                type: "grant",
                description: "Up to ₹50 lakhs for early-stage startups to validate proof of concept, prototype development, product trials, market entry and commercialization.",
                deadline: new Date("2025-12-31"),
                eligibility: "DPIIT recognized startups not more than 2 years old",
                sectors: ["Technology", "AI", "HealthTech", "EdTech", "AgriTech", "FinTech", "SaaS"],
                stages: ["Idea", "MVP", "seed"],
                country: "India",
                fundingAmount: "Up to ₹50L",
                applyUrl: "https://seedfund.startupindia.gov.in",
                source: "startup_india",
                isFeatured: true,
                tags: ["dpiit", "seed", "india", "government"],
            },
            {
                title: "Y Combinator S25 Batch",
                provider: "Y Combinator",
                type: "accelerator",
                description: "The world's most prestigious accelerator. $500K investment for 7% equity. 3-month program in San Francisco.",
                deadlineText: "Applications open Q1 2025",
                eligibility: "Early-stage startups globally. Strong team + idea required.",
                sectors: ["AI", "SaaS", "FinTech", "HealthTech", "B2B", "Consumer"],
                stages: ["Idea", "MVP", "seed"],
                country: "Global",
                fundingAmount: "$500K",
                applyUrl: "https://www.ycombinator.com/apply",
                source: "accelerator",
                isFeatured: true,
                tags: ["yc", "global", "top-tier", "equity"],
            },
            {
                title: "T-Hub Cohort 12",
                provider: "T-Hub, Hyderabad",
                type: "incubator",
                description: "India's largest startup incubator. 6-month program with mentorship, co-working space, and investor connects.",
                deadlineText: "Rolling applications",
                eligibility: "India-based startups at MVP or early revenue stage",
                sectors: ["Technology", "AI", "SaaS", "HealthTech", "AgriTech"],
                stages: ["MVP", "seed", "series A"],
                country: "India",
                fundingAmount: "₹5L - ₹25L grant + space",
                applyUrl: "https://t-hub.co",
                source: "incubator",
                tags: ["hyderabad", "india", "incubator", "government"],
            },
            {
                title: "Google for Startups Accelerator India",
                provider: "Google",
                type: "accelerator",
                description: "Equity-free program offering Google Cloud credits up to $200K, hands-on AI/ML mentorship, and access to Google networks.",
                deadlineText: "Cohort 2025 applications open",
                eligibility: "Seed to Series A Indian startups using AI/ML",
                sectors: ["AI", "ML", "SaaS", "Technology"],
                stages: ["seed", "series A"],
                country: "India",
                fundingAmount: "$200K cloud credits (equity-free)",
                applyUrl: "https://startup.google.com/accelerator/india",
                source: "corporate",
                isFeatured: true,
                tags: ["google", "ai", "ml", "equity-free", "cloud"],
            },
            {
                title: "NASSCOM 10000 Startups",
                provider: "NASSCOM",
                type: "program",
                description: "India's largest tech startup program connecting startups with industry, investors, and talent ecosystem.",
                deadlineText: "Rolling",
                eligibility: "Tech startups across India",
                sectors: ["Technology", "AI", "SaaS", "FinTech", "EdTech"],
                stages: ["MVP", "seed", "series A"],
                country: "India",
                fundingAmount: "Mentorship + Network (no direct funding)",
                applyUrl: "https://10000startups.com",
                source: "incubator",
                tags: ["nasscom", "india", "network", "tech"],
            },
            {
                title: "Sequoia Spark — India Seed Program",
                provider: "Sequoia Capital India",
                type: "accelerator",
                description: "Sequoia's pre-seed program for exceptional founders. Provides $100K–$1M investment plus hands-on support from Sequoia partners.",
                deadlineText: "Always accepting applications",
                eligibility: "Pre-seed founders with high conviction ideas",
                sectors: ["Consumer", "SaaS", "FinTech", "HealthTech", "B2B"],
                stages: ["Idea", "MVP"],
                country: "India",
                fundingAmount: "$100K – $1M",
                applyUrl: "https://www.sequoiacap.com/india/spark/",
                source: "accelerator",
                isFeatured: true,
                tags: ["sequoia", "india", "pre-seed", "top-tier"],
            },
            {
                title: "MeitY Startup Hub Grant",
                provider: "Ministry of Electronics & IT (MeitY)",
                type: "grant",
                description: "Government grant for deep-tech startups working on AI, Cybersecurity, IoT, Blockchain, and emerging technologies.",
                deadline: new Date("2025-09-30"),
                eligibility: "DPIIT recognized deep-tech startups up to 5 years old",
                sectors: ["AI", "Cybersecurity", "IoT", "Blockchain", "Technology"],
                stages: ["MVP", "seed", "series A"],
                country: "India",
                fundingAmount: "Up to ₹2 Cr",
                applyUrl: "https://msh.meity.gov.in",
                source: "government",
                isFeatured: true,
                tags: ["meity", "deep-tech", "government", "india"],
            },
            {
                title: "AWS Activate Founders",
                provider: "Amazon Web Services",
                type: "program",
                description: "AWS credits and technical support for early-stage startups. Up to $100K in AWS credits with no equity taken.",
                deadlineText: "Always open",
                eligibility: "Early-stage startups (pre-Series A) not yet using AWS Activate",
                sectors: ["Technology", "SaaS", "AI", "FinTech", "HealthTech"],
                stages: ["Idea", "MVP", "seed"],
                country: "Global",
                fundingAmount: "Up to $100K AWS credits",
                applyUrl: "https://aws.amazon.com/activate",
                source: "corporate",
                tags: ["aws", "cloud", "credits", "equity-free", "amazon"],
            },
            {
                title: "IIT Bombay E-Cell Social Alpha",
                provider: "IIT Bombay / Social Alpha",
                type: "incubator",
                description: "Incubation for climate-tech and social impact startups. Includes funding, lab access, and mentorship.",
                deadline: new Date("2025-08-15"),
                eligibility: "Climate tech, clean energy, and social impact startups",
                sectors: ["CleanTech", "SocialImpact", "AgriTech", "Technology"],
                stages: ["Idea", "MVP"],
                country: "India",
                fundingAmount: "₹15L – ₹50L",
                applyUrl: "https://ecell.in",
                source: "university",
                tags: ["iit", "climate", "social-impact", "india"],
            },
            {
                title: "Techstars Mumbai",
                provider: "Techstars",
                type: "accelerator",
                description: "3-month accelerator program for high-growth startups. $20K investment for 6% equity with $100K convertible note option.",
                deadlineText: "2025 applications open",
                eligibility: "Seed-stage startups in India with global ambitions",
                sectors: ["Technology", "SaaS", "AI", "FinTech", "HealthTech"],
                stages: ["seed", "series A"],
                country: "India",
                fundingAmount: "$20K + $100K note option",
                applyUrl: "https://www.techstars.com/accelerators/mumbai",
                source: "accelerator",
                tags: ["techstars", "mumbai", "global", "seed"],
            },
        ];

        await Grant.insertMany(sampleGrants);
        logger.info("[Grants] Initial seed completed");
        res.json({ success: true, message: `Seeded ${sampleGrants.length} grants successfully` });
    } catch (err) {
        logger.error({ err }, "[Grants] Seed failed");
        res.status(500).json({ success: false, message: err.message });
    }
};
