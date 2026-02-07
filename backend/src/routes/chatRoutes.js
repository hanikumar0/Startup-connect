import express from "express";
import { getMessages, getConversations } from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/messages/:conversationId", getMessages);

export default router;
