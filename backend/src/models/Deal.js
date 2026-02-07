import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
    {
        startup: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        investor: {
            type: mongoose.Schema.Types.ObjectId, // Link to User (Investor)
            ref: "User",
            required: true,
        },
        investorProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "InvestorProfile"
        },
        stage: {
            type: String,
            enum: ["PROSPECT", "CONTACTED", "DILIGENCE", "TERM_SHEET", "CLOSED", "LOST"],
            default: "PROSPECT",
        },
        amount: {
            type: Number,
            default: 0
        },
        notes: [
            {
                text: String,
                createdAt: { type: Date, default: Date.now }
            }
        ],
        lastActivity: {
            type: Date,
            default: Date.now
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Deal", dealSchema);
