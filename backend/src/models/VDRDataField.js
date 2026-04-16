import mongoose from "mongoose";

const vdrDataFieldSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VDRRoom",
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["startup", "investor"],
            required: true,
        },
        fieldType: {
            type: String,
            enum: ["text", "number", "json"],
            default: "text",
        },
        key: {
            type: String,
            required: true,
            trim: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed, // Can store string, number, or object (JSON)
            required: true,
        },
        visibility: {
            type: String,
            enum: ["private", "shared"],
            default: "shared",
        },
    },
    { 
        timestamps: true 
    }
);

// Compound index to ensure unique keys per room for a specific role (optional, depends on use case)
// For now, allow multiple fields with same key if needed, or unique? 
// User said "update value" via PATCH, which implies we should find by ID.

export default mongoose.model("VDRDataField", vdrDataFieldSchema);
