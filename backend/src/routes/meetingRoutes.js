import express from "express";
import { scheduleMeeting, getMyMeetings, getMeetingByRoomId } from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/schedule", scheduleMeeting);
router.get("/my-meetings", getMyMeetings);
router.get("/room/:roomId", getMeetingByRoomId);

export default router;
