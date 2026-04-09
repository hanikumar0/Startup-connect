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
        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ["startup", "investor", "superadmin", "moderator", "support"],
            default: "startup",
        },
        avatar: {
            type: String,
            default: null,
        },
        provider: {
            type: String,
            enum: ["email", "google", "linkedin"],
            default: "email",
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        onboardingCompleted: {
            type: Boolean,
            default: false,
        },
        lastLogin: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            enum: ["active", "blocked"],
            default: "active",
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
