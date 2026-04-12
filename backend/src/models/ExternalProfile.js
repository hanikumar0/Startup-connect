import mongoose from "mongoose";

const externalProfileSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, enum: ["startup", "investor"], required: true },
        source: { 
            type: String, 
            enum: ["producthunt", "github", "csv", "investors_raw", "LinkedIn", "Crunchbase", "AngelList", "Other"],
            required: true 
        },
        description: { type: String },
        website: { type: String },
        logo: { type: String },
        tags: [String],
        location: { type: String },
        stage: { type: String },
        funding: { type: String },
        firm: { type: String }, // Legacy compatibility
        industry: { type: String },
        email: { type: String },
        linkedinUrl: { type: String },
        isExternal: { type: Boolean, default: true },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.model("ExternalProfile", externalProfileSchema);
