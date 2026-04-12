import express from "express";
import { 
    scheduleMeeting, 
    getMyMeetings, 
    respondToMeeting 
} from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/schedule", scheduleMeeting);
router.get("/my-meetings", getMyMeetings);
router.put("/:id/respond", respondToMeeting);

export default router;
