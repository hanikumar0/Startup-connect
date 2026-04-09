import express from "express";
import { 
    getOrCreateConversation, 
    getMyConversations, 
    getMessages, 
    uploadChatFile, 
    markAsRead 
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(protect);

router.post("/conversation", getOrCreateConversation);
router.get("/conversations", getMyConversations);
router.get("/:conversationId", getMessages);
router.post("/upload", upload.single("file"), uploadChatFile);
router.put("/read/:conversationId", markAsRead);

export default router;
