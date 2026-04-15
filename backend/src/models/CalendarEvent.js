import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meeting",
            required: true,
        },
        source: {
            type: String,
            enum: ["internal", "google"],
            required: true,
        },
        externalEventId: {
            type: String,
        },
        startTime: {
            type: Date,
            required: true,
        },
        endTime: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

calendarEventSchema.index({ userId: 1, startTime: 1 });
calendarEventSchema.index({ meetingId: 1 });

export default mongoose.model("CalendarEvent", calendarEventSchema);
