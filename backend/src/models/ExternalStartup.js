import mongoose from "mongoose";

const externalStartupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        type: { type: String, default: "startup" },
        source: { type: String, enum: ["producthunt", "github"], required: true },
        description: { type: String },
        website: { type: String },
        logo: { type: String },
        tags: [String],
        industry: { type: String },
        isExternal: { type: Boolean, default: true },
        metadata: { type: mongoose.Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.model("ExternalStartup", externalStartupSchema);
