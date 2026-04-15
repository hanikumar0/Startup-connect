import Meeting from "../models/Meeting.js";
import meetingService from "../services/meetingService.js";
import calendarService from "../services/calendarService.js";
import { getIO } from "../sockets/index.js";

/**
 * @desc    Schedule a meeting
 * @route   POST /api/meetings
 */
export const scheduleMeeting = async (req, res) => {
    try {
        const meeting = await meetingService.scheduleMeeting({
            ...req.body,
            hostId: req.user.id
        });
        res.status(201).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Start an instant meeting
 * @route   POST /api/meetings/instant
 */
export const startInstantMeeting = async (req, res) => {
    try {
        const meeting = await meetingService.instantMeeting({
            ...req.body,
            hostId: req.user.id
        });
        res.status(201).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get all meetings for current user
 * @route   GET /api/meetings
 */
export const getMyMeetings = async (req, res) => {
    try {
        const userId = req.user.id;
        const meetings = await Meeting.find({
            $or: [{ hostId: userId }, { "participants.userId": userId }]
        })
        .populate("hostId participants.userId", "name email role avatar")
        .sort({ startTime: 1 });

        res.status(200).json({ success: true, meetings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get meeting by ID
 * @route   GET /api/meetings/:id
 */
export const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate("hostId participants.userId", "name email role avatar");
        
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
        
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Cancel a meeting
 * @route   POST /api/meetings/:id/cancel
 */
export const cancelMeeting = async (req, res) => {
    try {
        const { reason } = req.body;
        const meeting = await meetingService.cancelMeeting(req.params.id, req.user.id, reason);
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Reschedule a meeting
 * @route   POST /api/meetings/:id/reschedule
 */
export const rescheduleMeeting = async (req, res) => {
    try {
        const { startTime, duration } = req.body;
        const meeting = await meetingService.rescheduleMeeting(req.params.id, startTime, duration);
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Join a meeting (Check permissions)
 * @route   POST /api/meetings/:id/join
 */
export const joinMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

        const userId = req.user.id.toString();
        const isHost = meeting.hostId.toString() === userId;
        const isParticipant = meeting.participants.some(p => p.userId?.toString() === userId);

        if (!isHost && !isParticipant) {
            return res.status(403).json({ success: false, message: "You are not invited to this meeting" });
        }

        const status = meeting.computedStatus;
        if (status === "upcoming" && !isHost) {
            return res.status(403).json({ 
                success: false, 
                message: `SYSTEM RESTRICTION: Meeting starts at ${new Date(meeting.startTime).toLocaleTimeString()}. Access denied until scheduled precision.` 
            });
        }

        if (status === "ended") {
            return res.status(403).json({ success: false, message: "SYSTEM RESTRICTION: This session has already terminated." });
        }

        // Update status to 'joined' for participants
        if (isParticipant) {
            meeting.participants = meeting.participants.map(p => {
                if (p.userId?.toString() === userId) {
                    return { ...p.toObject(), status: "joined", joinedAt: new Date() };
                }
                return p;
            });
        }

        // Add to attendance log
        meeting.attendanceLog.push({
            userId: req.user.id,
            action: "join",
            timestamp: new Date()
        });

        await meeting.save();

        res.status(200).json({ success: true, meetingLink: meeting.meetingLink });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Request to cancel a meeting
 * @route   POST /api/meetings/:id/request-cancel
 */
export const requestCancellation = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) return res.status(400).json({ success: false, message: "Reason for cancellation is mandatory" });
        
        const meeting = await meetingService.requestCancellation(req.params.id, req.user.id, reason);
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Approve/Reject cancellation request
 * @route   POST /api/meetings/:id/approve-cancel/:requestId
 */
export const approveCancellation = async (req, res) => {
    try {
        const meeting = await meetingService.approveCancellation(req.params.id, req.params.requestId, req.user.id);
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Request to reschedule a meeting
 * @route   POST /api/meetings/:id/request-reschedule
 */
export const requestReschedule = async (req, res) => {
    try {
        const meeting = await meetingService.requestReschedule(req.params.id, req.user.id, req.body);
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Approve reschedule request
 * @route   POST /api/meetings/:id/approve-reschedule/:requestId
 */
export const approveReschedule = async (req, res) => {
    try {
        const meeting = await meetingService.approveReschedule(req.params.id, req.params.requestId, req.user.id);
        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get AI suggested times for rescheduling
 * @route   GET /api/meetings/:id/ai-suggestions
 */
export const getAISuggestions = async (req, res) => {
    try {
        const suggestions = await meetingService.getAISuggestions(req.params.id);
        res.status(200).json({ success: true, suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Disconnect from a meeting (Host ends it, participant leaves it)
 * @route   POST /api/meetings/:id/disconnect
 */
export const disconnectFromMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);
        if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });

        const userId = req.user.id.toString();
        const isHost = meeting.hostId.toString() === userId;

        if (isHost) {
            // If HOST disconnects → End the meeting for everyone
            meeting.status = "ended";
            // Record in attendance log
            meeting.attendanceLog.push({
                userId: req.user.id,
                action: "leave",
                timestamp: new Date()
            });
            console.log(`[MEETING] Session ${meeting._id} terminated by Host ${userId}`);

            // Notify everyone via Socket.io
            const io = getIO();
            if (io) {
                io.to(`meeting_${meeting._id}`).emit("meeting_ended");
            }
        } else {
            // If PARTICIPANT disconnects → Just mark them as left
            meeting.participants = meeting.participants.map(p => {
                if (p.userId?.toString() === userId) {
                    return { ...p.toObject(), status: "left", leftAt: new Date() };
                }
                return p;
            });

            meeting.attendanceLog.push({
                userId: req.user.id,
                action: "leave",
                timestamp: new Date()
            });

            // If no active participants left (and it's not the host who left), auto-end
            const activeParticipants = meeting.participants.filter(p => p.status === "joined");
            if (activeParticipants.length === 0) {
                // If the only person left was a guest who just left, and host is not in room
                // For simplicity, we check if anybody is still "joined"
                meeting.status = "ended";
                console.log(`[MEETING] Session ${meeting._id} auto-terminated: No active participants`);
            }
        }

        await meeting.save();

        res.status(200).json({ 
            success: true, 
            message: isHost ? "Meeting ended by host" : "Left meeting successfully",
            ended: meeting.status === "ended"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
