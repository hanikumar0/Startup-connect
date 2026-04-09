import express from "express";
import { 
    getUserNotifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    deleteNotification 
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getUserNotifications);
router.put("/read-all", markAllNotificationsRead);
router.put("/read/:id", markNotificationRead);
router.delete("/:id", deleteNotification);

export default router;
