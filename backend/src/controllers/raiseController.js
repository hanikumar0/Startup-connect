import RaiseRound from "../models/RaiseRound.js";
import CRMLead from "../models/CRMLead.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import logger from "../config/logger.js";

export const createRound = async (req, res) => {
    try {
        const startupId = req.user.id;
        
        // Deactivate existing active rounds
        await RaiseRound.updateMany({ startupId, status: 'active' }, { status: 'closed' });

        const round = await RaiseRound.create({
            ...req.body,
            startupId,
            status: 'active'
        });

        logger.info(`[RaiseTracker] Round Created for startup ${startupId}: ${round.roundType}`);

        res.status(201).json({ success: true, round });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyRound = async (req, res) => {
    try {
        const round = await RaiseRound.findOne({ startupId: req.user.id, status: { $ne: 'closed' } })
            .populate('commitments.investorId', 'name companyName avatar');

        if (!round) {
            return res.status(200).json({ success: true, round: null });
        }

        // Fetch CRM metrics for auto-sync
        const crmMetrics = await CRMLead.aggregate([
            { $match: { ownerUserId: req.user.id } },
            { $group: { _id: "$stage", count: { $sum: 1 } } }
        ]);

        const metricsMap = crmMetrics.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        res.status(200).json({ 
            success: true, 
            round,
            pipeline: {
                totalContacted: (metricsMap['contacted'] || 0) + (metricsMap['replied'] || 0) + (metricsMap['meeting_scheduled'] || 0) + (metricsMap['interested'] || 0),
                responses: (metricsMap['replied'] || 0) + (metricsMap['meeting_scheduled'] || 0) + (metricsMap['interested'] || 0),
                meetings: metricsMap['meeting_scheduled'] || 0,
                dueDiligence: metricsMap['dd'] || 0,
                committed: metricsMap['committed'] || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addCommitment = async (req, res) => {
    try {
        const { amount, type, investorId, status } = req.body;
        const startupId = req.user.id;

        const round = await RaiseRound.findOne({ startupId, status: 'active' });
        if (!round) return res.status(404).json({ success: false, message: "No active round found" });

        round.commitments.push({ 
            investorId, 
            amount: Number(amount), 
            type, 
            status: status || 'confirmed' 
        });

        // Update totals
        if (type === 'hard') {
            round.hardCommittedAmount += Number(amount);
        } else {
            round.softCommittedAmount += Number(amount);
        }

        await round.save();

        logger.info(`[RaiseTracker] Commitment Added: ${type} commit of ${amount} for round ${round._id}`);

        // Notification if it hits 50%
        const progress = round.progressPercentage;
        if (progress >= 50) {
             await createNotification({
                userId: startupId,
                type: 'raise_milestone',
                title: 'Major Milestone Reached!',
                message: `Your round is now ${Math.round(progress)}% funded! Keep the momentum going.`,
                link: '/dashboard/raise'
            });
        }

        res.status(200).json({ success: true, round });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRaiseAnalytics = async (req, res) => {
    try {
        const startupId = req.user.id;
        const round = await RaiseRound.findOne({ startupId, status: 'active' });

        if (!round) return res.status(200).json({ success: true, analytics: null });

        // Simple Forecast Logic (AI placeholder)
        const daysRemaining = round.targetCloseDate ? 
            Math.ceil((new Date(round.targetCloseDate) - new Date()) / (1000 * 60 * 60 * 24)) : 30;

        const forecast = {
            likelyCloseDate: new Date(Date.now() + (daysRemaining * 0.8) * 24 * 60 * 60 * 1000),
            closingRisk: round.hardCommittedAmount < (round.targetAmount * 0.1) ? 'high' : 'low',
            message: `At current pace, you need approx ${Math.max(5, 10 - round.commitments.length)} more investor meetings to hit target.`
        };

        res.status(200).json({ success: true, forecast });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
