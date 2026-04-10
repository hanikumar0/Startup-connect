import mongoose from "mongoose";

const externalProfileSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        firm: { type: String },
        email: { type: String },
        linkedinUrl: { type: String },
        website: { type: String },
        industry: { type: String },
        investmentFocus: [String],
        location: { type: String },
        stage: { type: String },
        description: { type: String },
        investor_type: { type: String },
        leadType: { type: String },
        role: { type: String },
        countries: [String],
        min_check: { type: String },
        max_check: { type: String },
        source: { 
            type: String, 
            enum: ["LinkedIn", "Crunchbase", "AngelList", "YC directory", "Product Hunt", "GitHub", "producthunt", "github", "csv", "investors_raw", "OpenVC dataset", "Other", "CSV", "Scraper", "API", "Uploaded"],
            required: true 
        },
        type: { type: String, enum: ["startup", "investor"], required: true },
        isExternal: { type: Boolean, default: true },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.model("ExternalProfile", externalProfileSchema);
