import mongoose from "mongoose";

const externalInvestorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, default: "investor" },
        source: { type: String, default: "csv" },
        description: { type: String },
        website: { type: String },
        logo: { type: String },
        industry: { type: String },
        isExternal: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("ExternalInvestor", externalInvestorSchema);
