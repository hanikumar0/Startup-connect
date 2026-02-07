import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        phone: {
            type: String,
            unique: true,
            sparse: true,
        },

        password: {
            type: String,
            minlength: 6,
            select: false,
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },

        linkedinId: {
            type: String,
            unique: true,
            sparse: true,
        },

        role: {
            type: String,
            enum: ["STARTUP", "INVESTOR", "ADMIN"],
            default: "STARTUP",
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        isPhoneVerified: {
            type: Boolean,
            default: false,
        },

        // Verification Data
        aadhaarLast4: { type: String, default: null },
        panNumber: { type: String, default: null },
        gstNumber: { type: String, default: null },
        udyamNumber: { type: String, default: null },
        dpiitNumber: { type: String, default: null },
        cinNumber: { type: String, default: null },

        verificationStatus: {
            type: String,
            enum: ["PENDING", "VERIFIED", "REJECTED"],
            default: "PENDING",
        },

        isProfileCompleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
