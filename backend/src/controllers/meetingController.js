import Meeting from "../models/Meeting.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

// @desc    Schedule a meeting
// @route   POST /api/meetings/schedule
export const scheduleMeeting = async (req, res) => {
    try {
        const { title, guestId, startTime, duration = 30 } = req.body;
        const userId = req.user.id;

        // Auto-detect conversation if it exists
        const conversation = await Conversation.findOne({
            participants: { $all: [userId, guestId] }
        });

        const meeting = await Meeting.create({
            title,
            creatorId: userId,
            participantId: guestId,
            startTime,
            duration,
            conversationId: conversation?._id,
            status: "scheduled"
        });

        // Add 📅 notification message to chat if conversation exists
        if (conversation) {
            await Message.create({
                conversationId: conversation._id,
                senderId: userId,
                text: `📅 New Meeting Scheduled: ${title} at ${new Date(startTime).toLocaleString()}`,
                messageType: "meeting"
            });
            
            await Conversation.findByIdAndUpdate(conversation._id, {
                lastMessage: {
                    text: `📅 Scheduled: ${title}`,
                    senderId: userId,
                    at: new Date()
                }
            });
        }

        // Create persistent notification for guest
        await Notification.create({
            userId: guestId,
            sender: userId,
            type: "meeting_scheduled",
            title: "Meeting Scheduled",
            message: `${req.user.name} has scheduled a meeting with you.`,
            link: "/dashboard/meetings"
        });

        res.status(201).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all meetings for user (Creator or Participant)
// @route   GET /api/meetings/my-meetings
export const getMyMeetings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const meetings = await Meeting.find({
            $or: [{ creatorId: userId }, { participantId: userId }]
        })
        .populate("creatorId participantId", "name email role avatar")
        .sort({ startTime: 1 });

        // Map meetings to include a "partner" name relative to the current user
        const formatted = meetings.map(m => {
            const partner = m.creatorId._id.toString() === userId.toString() ? m.participantId : m.creatorId;
            return {
                ...m.toObject(),
                partner: partner.name,
                partnerRole: partner.role,
                partnerAvatar: partner.avatar,
                roomId: m._id // Using meeting ID as room ID for simplicity
            };
        });

        res.status(200).json({ success: true, meetings: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Respond to meeting (Accept/Reject)
// @route   PUT /api/meetings/:id/respond
export const respondToMeeting = async (req, res) => {
    try {
        const { status } = req.body;
        const meeting = await Meeting.findById(req.params.id);
        
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

        meeting.status = status; // accepted, rejected, cancelled
        await meeting.save();

        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
