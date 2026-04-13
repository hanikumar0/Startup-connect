import express from "express";
import { 
    getOrCreateConversation, 
    sendMessage,
    getMyConversations, 
    getMessages, 
    uploadChatFile, 
    markAsRead,
    trackPitchView,
    editMessage,
    deleteMessage,
    deleteForMe
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.use(protect);

router.post("/conversation", getOrCreateConversation);
router.post("/send", sendMessage);
router.post("/", sendMessage); // Supporting POST /api/message and POST /api/messages
router.get("/conversations", getMyConversations);
router.get("/:conversationId", getMessages);
router.post("/upload", upload.single("file"), uploadChatFile);
router.put("/read/:conversationId", markAsRead);
router.post("/view-pitch/:messageId", trackPitchView);
router.put("/:id", editMessage);
router.delete("/:id", deleteMessage);

router.put("/delete-for-me/:id", deleteForMe);

export default router;
