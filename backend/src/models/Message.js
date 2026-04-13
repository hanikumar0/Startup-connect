import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
        },
        attachments: [
            {
                fileName: String,
                fileUrl: String,
                fileType: String,
                resourceType: String,
                fileSize: Number,
            },
        ],
        messageType: {
            type: String,
            enum: ["text", "image", "file", "pitch", "meeting", "link"],
            default: "text",
        },
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        fileType: String,
        resourceType: String,
        meetingInfo: {
            meetingId: mongoose.Schema.Types.ObjectId,
            title: String,
            startTime: Date,
            status: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        isDeletedForBoth: {
            type: Boolean,
            default: false,
        },
        deletedFor: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        reactions: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                emoji: String,
            },
        ],
        isForwarded: {
            type: Boolean,
            default: false,
        },
        replyTo: {
            messageId: mongoose.Schema.Types.ObjectId,
            text: String,
            senderName: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
