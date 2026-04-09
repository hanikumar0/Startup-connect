import express from "express";
import { 
    requestMeeting, 
    acceptMeeting, 
    rejectMeeting, 
    getMyMeetings, 
    cancelMeeting 
} from "../controllers/meetingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/request", requestMeeting);
router.get("/", getMyMeetings);
router.put("/accept/:id", acceptMeeting);
router.put("/reject/:id", rejectMeeting);
router.put("/cancel/:id", cancelMeeting);

export default router;
