import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        lastMessage: {
            text: String,
            senderId: mongoose.Schema.Types.ObjectId,
            at: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Index to quickly find conversations for a user
conversationSchema.index({ participants: 1 });

export default mongoose.model("Conversation", conversationSchema);
