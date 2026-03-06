import Message from "../models/Message.js";

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        if (!conversationId) {
            return res.status(400).json({ message: "Conversation ID is required" });
        }

        // Pagination support
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Reverse to chronological order for display
        messages.reverse();

        res.status(200).json({ success: true, messages, page, limit });
    } catch (error) {
        console.error("Get Messages Error:", error.message);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        // Use aggregation pipeline for efficient unique conversation lookup
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: { $eq: userId } },
                        { receiverId: { $eq: userId } }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                    messageCount: { $sum: 1 },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ["$receiverId", userId] },
                                        { $eq: ["$isRead", false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { "lastMessage.createdAt": -1 } },
            { $limit: 50 }
        ]);

        // Populate sender/receiver info
        const populatedConversations = await Message.populate(
            conversations.map(c => c.lastMessage),
            { path: "senderId receiverId", select: "name email" }
        );

        const result = conversations.map((conv, i) => ({
            conversationId: conv._id,
            lastMessage: populatedConversations[i],
            messageCount: conv.messageCount,
            unreadCount: conv.unreadCount,
        }));

        res.status(200).json({ success: true, conversations: result });
    } catch (error) {
        console.error("Get Conversations Error:", error.message);
        res.status(500).json({ message: "Failed to fetch conversations" });
    }
};
