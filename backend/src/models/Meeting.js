import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
    {
        initiatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        guestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["SCHEDULED", "ONGOING", "COMPLETED", "CANCELLED"],
            default: "SCHEDULED",
        },
        roomId: {
            type: String,
            required: true,
            unique: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Meeting", meetingSchema);
