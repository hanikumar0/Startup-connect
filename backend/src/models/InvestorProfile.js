import mongoose from "mongoose";

const investorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        firmName: {
            type: String,
        },
        investorType: {
            type: String,
            enum: ["ANGEL", "VC", "PE", "CORPORATE"],
            required: true,
        },
        industries: [String], // Array of preferred industries
        fundingStages: [String], // Preferred stages
        minInvestment: {
            type: Number,
            default: 0,
        },
        maxInvestment: {
            type: Number,
            default: 0,
        },
        bio: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("InvestorProfile", investorProfileSchema);
