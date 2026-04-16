import mongoose from "mongoose";

const vdrMessageSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VDRRoom",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderRole: {
            type: String,
            enum: ["startup", "investor"],
            required: true,
        },
        message: {
            type: String, // Encrypted string
            required: true,
        },
        readStatus: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("VDRMessage", vdrMessageSchema);
