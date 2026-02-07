import mongoose from "mongoose";

const vdrDocumentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["Financials", "Legal", "Product", "Cap Table", "Pitch Deck", "Other"],
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        isRestricted: {
            type: Boolean,
            default: true,
        },
        authorizedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        accessRequests: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        size: Number,
        fileType: String,
        aiSummary: String,
        riskScore: { type: Number, default: 0 },
        keyClauses: [String],
    },
    { timestamps: true }
);

export default mongoose.model("VDRDocument", vdrDocumentSchema);
