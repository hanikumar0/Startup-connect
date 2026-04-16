import mongoose from "mongoose";

const vdrFileSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VDRRoom",
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String, // PDF, XLSX, etc.
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["pitch_deck", "financials", "legal", "traction", "other"],
            default: "other",
            required: true,
        },
        description: {
            type: String,
            trim: true,
        },
        version: {
            type: Number,
            default: 1,
        },
        isEncrypted: {
            type: Boolean,
            default: false,
        },
        tags: [{
            type: String,
            trim: true
        }],
        visibility: {
            type: String,
            enum: ["private", "shared"],
            default: "shared",
        },
        // To track version history
        parentFileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VDRFile",
            default: null,
        }
    },
    { 
        timestamps: { createdAt: "uploadedAt", updatedAt: "lastUpdated" } 
    }
);

// Index for faster fetching by room and visibility
vdrFileSchema.index({ roomId: 1, visibility: 1 });

export default mongoose.model("VDRFile", vdrFileSchema);
