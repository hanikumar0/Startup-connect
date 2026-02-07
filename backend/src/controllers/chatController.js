import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        // Find unique conversations where user is either sender or receiver
        const conversations = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .sort({ createdAt: -1 })
            .populate("senderId receiverId", "name email");

        // Logic to group by conversationId and return the latest message for each
        const uniqueConversations = [];
        const seenIds = new Set();

        for (const msg of conversations) {
            if (!seenIds.has(msg.conversationId)) {
                seenIds.add(msg.conversationId);
                uniqueConversations.push(msg);
            }
        }

        res.status(200).json({ success: true, conversations: uniqueConversations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
