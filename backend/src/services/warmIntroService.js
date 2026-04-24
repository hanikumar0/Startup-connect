
import Connection from "../models/Connection.js";
import User from "../models/User.js";
import Investor from "../models/Investor.js";
import Startup from "../models/Startup.js";
import Match from "../models/Match.js";

/**
 * Service to find warm intro paths between a startup and an investor
 */
export const findIntroPaths = async (startupId, investorId) => {
    const paths = [];

    const startup = await Startup.findById(startupId);
    const investor = await Investor.findById(investorId);

    if (!startup || !investor) return [];

    const startupUserId = startup.userId;
    const investorUserId = investor.userId;

    // 1. Mutual Connections (The Gold Standard)
    // Find people connected to both startup owner and investor owner
    if (startupUserId && investorUserId) {
        const startupConns = await Connection.find({
            $or: [{ sender: startupUserId }, { recipient: startupUserId }],
            status: "ACCEPTED"
        });

        const investorConns = await Connection.find({
            $or: [{ sender: investorUserId }, { recipient: investorUserId }],
            status: "ACCEPTED"
        });

        const startupFriends = startupConns.map(c => 
            c.sender.toString() === startupUserId.toString() ? c.recipient.toString() : c.sender.toString()
        );

        const investorFriends = investorConns.map(c => 
            c.sender.toString() === investorUserId.toString() ? c.recipient.toString() : c.sender.toString()
        );

        const mutuals = startupFriends.filter(f => investorFriends.includes(f));

        for (const mId of mutuals) {
            const user = await User.findById(mId);
            if (user) {
                paths.push({
                    type: "Mutual Connection",
                    connectorId: user._id,
                    name: user.name,
                    strength: 90,
                    reason: `Both connected to ${user.name}`
                });
            }
        }
    }

    // 2. Portfolio Founders
    // Founders that the investor has already matched with at high score or connected with
    // We search for Startups that have an ACCEPTED connection with the investor user
    if (investorUserId) {
        const portfolioConns = await Connection.find({
            $or: [{ sender: investorUserId }, { recipient: investorUserId }],
            status: "ACCEPTED"
        });

        for (const conn of portfolioConns) {
            const otherId = conn.sender.toString() === investorUserId.toString() ? conn.recipient : conn.sender;
            const otherUser = await User.findById(otherId);
            if (otherUser && otherUser.role === "startup") {
                paths.push({
                    type: "Portfolio Founder",
                    connectorId: otherUser._id,
                    name: otherUser.name,
                    strength: 95,
                    reason: `Portfolio founder: ${otherUser.name}`
                });
            }
        }
    }

    // 3. Mentors (Users who have interacted with many startups/investors)
    // For now, any user with high activity can be a connector
    // We'll search for users who have connections with both

    // 4. Ecosystem Fit (Same Industry Alumni)
    const mutualIndustryInvestors = await Investor.find({
        preferredIndustries: { $in: [startup.industry] },
        _id: { $ne: investorId }
    }).limit(3);

    for (const otherInv of mutualIndustryInvestors) {
        if (otherInv.userId) {
            const user = await User.findById(otherInv.userId);
            if (user) {
                paths.push({
                    type: "Ecosystem Peer",
                    connectorId: user._id,
                    name: user.name,
                    strength: 70,
                    reason: `Fellow ${startup.industry} investor`
                });
            }
        }
    }

    // Sort by strength
    return paths.sort((a, b) => b.strength - a.strength);
};

export default { findIntroPaths };
