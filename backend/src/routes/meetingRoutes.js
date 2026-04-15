import express from "express";
import { 
    scheduleMeeting, 
    getMyMeetings, 
    getMeetingById,
    startInstantMeeting,
    cancelMeeting,
    rescheduleMeeting,
    joinMeeting,
    requestCancellation,
    approveCancellation,
    requestReschedule,
    approveReschedule,
    getAISuggestions,
    disconnectFromMeeting
} from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", scheduleMeeting);
router.get("/", getMyMeetings);
router.get("/:id", getMeetingById);
router.post("/instant", startInstantMeeting);
router.post("/:id/cancel", cancelMeeting);
router.post("/:id/reschedule", rescheduleMeeting);
router.post("/:id/join", joinMeeting);
router.post("/:id/disconnect", disconnectFromMeeting);

// Advanced Lifecycle
router.post("/:id/request-cancel", requestCancellation);
router.post("/:id/approve-cancel/:requestId", approveCancellation);
router.post("/:id/request-reschedule", requestReschedule);
router.post("/:id/approve-reschedule/:requestId", approveReschedule);
router.get("/:id/ai-suggestions", getAISuggestions);

export default router;
