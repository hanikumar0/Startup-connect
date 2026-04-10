import mongoose from "mongoose";

const outreachLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        externalProfileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExternalProfile",
            required: true,
        },
        message: { type: String, required: true },
        type: { type: String, enum: ["EMAIL", "LINKEDIN"], default: "EMAIL" },
        status: {
            type: String,
            enum: ["SENT", "OPENED", "REPLIED", "CONNECTED"],
            default: "SENT",
        },
        sentAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export default mongoose.model("OutreachLog", outreachLogSchema);
