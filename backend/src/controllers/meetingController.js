import Meeting from "../models/Meeting.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";

// @desc    Request a meeting
// @route   POST /api/meetings/request
export const requestMeeting = async (req, res) => {
    try {
        const { title, description, startupId, investorId, meetingDate, meetingTime, duration, timezone, conversationId } = req.body;

        const meeting = await Meeting.create({
            title,
            description,
            startupId,
            investorId,
            requestedBy: req.user.id,
            meetingDate,
            meetingTime,
            duration,
            timezone,
            conversationId
        });

        // 1. Create message in chat
        if (conversationId) {
            await Message.create({
                conversationId,
                senderId: req.user.id,
                text: `📅 Meeting Proposed: ${title} on ${new Date(meetingDate).toLocaleDateString()} at ${meetingTime}`,
                messageType: "meeting"
            });
            
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: {
                    text: `📅 Meeting Requested: ${title}`,
                    senderId: req.user.id,
                    at: new Date()
                }
            });
        }

        // 2. Create notification for the other party
        let targetUserId;
        if (req.user.role === "startup") {
            const inv = await Investor.findById(investorId);
            targetUserId = inv.userId;
        } else {
            const sta = await Startup.findById(startupId);
            targetUserId = sta.userId;
        }

        await createNotification({
            userId: targetUserId,
            type: "meeting_request",
            title: "New Meeting Request",
            message: `${req.user.name} has requested a meeting: ${title}`,
            link: "/meetings"
        });

        res.status(201).json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Accept a meeting
// @route   PUT /api/meetings/accept/:id
export const acceptMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

        meeting.status = "accepted";
        meeting.meetingLink = "https://meet.google.com/abc-defg-hij"; // Placeholder or dynamic link generator
        await meeting.save();

        // 1. Chat Message
        if (meeting.conversationId) {
            await Message.create({
                conversationId: meeting.conversationId,
                senderId: req.user.id,
                text: `✅ Meeting Confirmed: ${new Date(meeting.meetingDate).toLocaleDateString()} at ${meeting.meetingTime}. Join here: ${meeting.meetingLink}`,
                messageType: "meeting"
            });
        }

        // 2. Notification
        await createNotification({
            userId: meeting.requestedBy,
            type: "meeting_accepted",
            title: "Meeting Accepted",
            message: `${req.user.name} accepted your meeting request.`,
            link: "/meetings"
        });

        res.status(200).json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject a meeting
// @route   PUT /api/meetings/reject/:id
export const rejectMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        meeting.status = "rejected";
        await meeting.save();

        if (meeting.conversationId) {
            await Message.create({
                conversationId: meeting.conversationId,
                senderId: req.user.id,
                text: `❌ Meeting Declined: ${meeting.title}`,
                messageType: "text"
            });
        }

        res.status(200).json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all meetings for user
// @route   GET /api/meetings
export const getMyMeetings = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === "startup") {
            const startup = await Startup.findOne({ userId: req.user.id });
            query = { startupId: startup._id };
        } else if (req.user.role === "investor") {
            const investor = await Investor.findOne({ userId: req.user.id });
            query = { investorId: investor._id };
        }

        const meetings = await Meeting.find(query)
            .populate("startupId", "startupName logo")
            .populate("investorId", "investorName logo firmName")
            .sort("meetingDate");

        res.status(200).json({ success: true, data: meetings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel a meeting
// @route   PUT /api/meetings/cancel/:id
export const cancelMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
        res.status(200).json({ success: true, data: meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
