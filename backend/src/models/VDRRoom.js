import mongoose from "mongoose";

const vdrRoomSchema = new mongoose.Schema(
    {
        startupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        investorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        matchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Connection", // Assuming match refers to Connection as per existing code
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        encryptionKey: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure only one room per match
vdrRoomSchema.index({ matchId: 1 }, { unique: true });

export default mongoose.model("VDRRoom", vdrRoomSchema);
