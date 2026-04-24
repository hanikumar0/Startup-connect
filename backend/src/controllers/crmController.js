import CRMLead from "../models/CRMLead.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import logger from "../config/logger.js";

const INVESTOR_STAGES = [
    { id: "new_leads", label: "New Leads" },
    { id: "interested", label: "Interested" },
    { id: "meeting", label: "Meeting" },
    { id: "dd", label: "Due Diligence" },
    { id: "negotiation", label: "Negotiation" },
    { id: "invested", label: "Invested" },
    { id: "rejected", label: "Rejected" },
    { id: "on_hold", label: "On Hold" }
];

const STARTUP_STAGES = [
    { id: "target_list", label: "Target List" },
    { id: "contacted", label: "Contacted" },
    { id: "replied", label: "Replied" },
    { id: "meeting_scheduled", label: "Meeting Scheduled" },
    { id: "interested", label: "Interested" },
    { id: "dd", label: "Due Diligence" },
    { id: "committed", label: "Committed" },
    { id: "passed", label: "Passed" },
    { id: "follow_up", label: "Follow Up Later" }
];

export const getCRMLeads = async (req, res) => {
    try {
        const ownerUserId = req.user.id;
        const leads = await CRMLead.find({ ownerUserId, status: 'active' })
            .populate('targetId', 'name email companyName avatar role headline focus stage investorType')
            .sort({ lastActivityAt: -1 });

        const stages = req.user.role.toLowerCase() === 'investor' ? INVESTOR_STAGES : STARTUP_STAGES;

        res.status(200).json({ success: true, leads, stages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addLead = async (req, res) => {
    try {
        const { targetId, initialStage, scoreSnapshot } = req.body;
        const ownerUserId = req.user.id;
        const ownerRole = req.user.role.toLowerCase();

        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ success: false, message: "Target not found" });

        const defaultStage = ownerRole === 'investor' ? 'new_leads' : 'target_list';

        const lead = await CRMLead.findOneAndUpdate(
            { ownerUserId, targetId },
            {
                ownerRole,
                targetType: targetUser.role.toLowerCase(),
                stage: initialStage || defaultStage,
                scoreSnapshot,
                status: 'active',
                lastActivityAt: Date.now()
            },
            { upsert: true, new: true }
        );

        logger.info(`[CRM] Lead Added: ${targetId} to ${ownerUserId}'s pipeline`);

        res.status(201).json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const moveStage = async (req, res) => {
    try {
        const { leadId, newStage } = req.body;
        const lead = await CRMLead.findOne({ _id: leadId, ownerUserId: req.user.id });

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        const oldStage = lead.stage;
        lead.stage = newStage;
        lead.lastActivityAt = Date.now();
        await lead.save();

        logger.info(`[CRM] Stage Updated: Lead ${leadId} moved to ${newStage}`);

        // Trigger notifications for significant moves
        if (newStage === 'dd') {
            await createNotification({
                userId: req.user.id,
                type: 'crm_update',
                title: 'Due Diligence Started',
                message: `You've moved a lead to Due Diligence. Secure VDR access is now prioritized.`,
                link: '/dashboard/vdr'
            });
        }

        res.status(200).json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addNote = async (req, res) => {
    try {
        const { leadId, content } = req.body;
        const lead = await CRMLead.findOne({ _id: leadId, ownerUserId: req.user.id });

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        lead.notes.push({ content, createdBy: req.user.id });
        lead.lastActivityAt = Date.now();
        await lead.save();

        logger.info(`[CRM] Note Added to Lead ${leadId}`);

        res.status(201).json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addTask = async (req, res) => {
    try {
        const { leadId, title, dueDate, priority } = req.body;
        const lead = await CRMLead.findOne({ _id: leadId, ownerUserId: req.user.id });

        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        lead.tasks.push({ title, dueDate, priority });
        lead.lastActivityAt = Date.now();
        await lead.save();

        logger.info(`[CRM] Task Created for Lead ${leadId}`);

        res.status(201).json({ success: true, lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCRMAnalytics = async (req, res) => {
    try {
        const ownerUserId = req.user.id;
        const role = req.user.role.toLowerCase();

        const leads = await CRMLead.find({ ownerUserId, status: 'active' });

        if (role === 'investor') {
            const stats = {
                totalLeads: leads.length,
                dealsInDD: leads.filter(l => l.stage === 'dd').length,
                invested: leads.filter(l => l.stage === 'invested').length,
                meetings: leads.filter(l => l.stage === 'meeting').length
            };
            return res.status(200).json({ success: true, stats });
        } else {
            const stats = {
                investorsContacted: leads.filter(l => l.stage !== 'target_list').length,
                repliesReceived: leads.filter(l => ['replied', 'interested', 'meeting_scheduled'].includes(l.stage)).length,
                meetingsBooked: leads.filter(l => l.stage === 'meeting_scheduled').length,
                committedAmount: 0 // In a real app, we'd store the amount on the lead
            };
            return res.status(200).json({ success: true, stats });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
