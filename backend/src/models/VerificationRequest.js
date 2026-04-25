import mongoose from "mongoose";

const verificationRequestSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        role: {
            type: String,
            enum: ["startup", "investor", "mentor"],
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "under_review", "approved", "rejected"],
            default: "pending",
        },
        requestedBadges: [{ type: String }],
        awardedBadges: [{ type: String }],
        
        // Verification signals
        emailDomainVerified: { type: Boolean, default: false },
        linkedinVerified: { type: Boolean, default: false },
        companyDocVerified: { type: Boolean, default: false },
        manualApproved: { type: Boolean, default: false },
        
        // Submitted documents/links
        linkedinUrl: { type: String },
        companyRegDoc: { type: String }, // Cloudinary URL
        gstNumber: { type: String },
        cinNumber: { type: String },
        msmeNumber: { type: String },
        websiteUrl: { type: String },
        additionalNotes: { type: String },
        
        // Admin
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date },
        rejectionReason: { type: String },
        adminNotes: { type: String },
        
        // Auto-computed trust score (0-100)
        trustScore: { type: Number, default: 0 },
    },
    { timestamps: true }
);

verificationRequestSchema.index({ userId: 1, status: 1 });

export default mongoose.model("VerificationRequest", verificationRequestSchema);
