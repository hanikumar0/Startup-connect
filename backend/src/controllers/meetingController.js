import Meeting from "../models/Meeting.js";
import { v4 as uuidv4 } from "uuid";

export const scheduleMeeting = async (req, res) => {
    try {
        const { guestId, title, startTime, endTime } = req.body;
        const initiatorId = req.user.id;

        const roomId = uuidv4();

        const meeting = await Meeting.create({
            initiatorId,
            guestId,
            title,
            startTime,
            endTime,
            roomId,
        });

        res.status(201).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyMeetings = async (req, res) => {
    try {
        const userId = req.user.id;
        const meetings = await Meeting.find({
            $or: [{ initiatorId: userId }, { guestId: userId }],
        })
            .sort({ startTime: 1 })
            .populate("initiatorId guestId", "name email");

        res.status(200).json({ success: true, meetings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMeetingByRoomId = async (req, res) => {
    try {
        const { roomId } = req.params;
        const meeting = await Meeting.findOne({ roomId }).populate("initiatorId guestId", "name email");

        if (!meeting) {
            return res.status(404).json({ message: "Meeting not found" });
        }

        res.status(200).json({ success: true, meeting });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
