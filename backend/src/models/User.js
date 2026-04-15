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
        // Enhanced Profile Fields
        location: { type: String, trim: true },
        phone: { type: String, trim: true },
        phoneVerified: { type: Boolean, default: false },
        emailVerified: { type: Boolean, default: false },
        
        companyName: { type: String, trim: true },
        website: { type: String, trim: true },
        logo: { type: String, default: null },
        headline: { type: String, trim: true, maxlength: 300 },
        focus: [{ type: String }],
        tags: [{ type: String }],
        funding: { type: String, trim: true }, // Funding Ask for Startup, Range for Investor
        
        // Matchmaking & Rule-Based Controls
        isPublic: { type: Boolean, default: true },
        lastHeadlineUpdate: { type: Date, default: null },
        lastFocusUpdate: { type: Date, default: null },
        
        // Role Specific - Startup
        stage: { 
            type: String, 
            enum: ["Idea", "MVP", "Early Revenue", "Growth", "Scaling"], 
            default: "Idea" 
        },
        coFounders: [{ type: String, lowercase: true, trim: true }],
        
        // Role Specific - Investor
        investorType: { 
            type: String, 
            enum: ["Individual", "Firm", "Financial Agency", "Angel"],
            default: "Individual"
        },
        investorStage: {
            type: String,
            enum: ["New", "Active", "Lead Investor", "Top Investor"],
            default: "New"
        },
        investmentsMadeCount: { type: Number, default: 0 },
        totalAmountInvested: { type: Number, default: 0 },

        // KYC (eKYC) Architecture
        kycStatus: {
            type: String,
            enum: ["not_submitted", "pending", "verified", "rejected"],
            default: "not_submitted"
        },
        kycData: {
            dob: { type: Date },
            country: { type: String, trim: true },
            idType: { type: String, enum: ["Aadhaar", "PAN", "Passport", "Driving License"] },
            idNumber: { type: String, trim: true },
            idDocument: { type: String }, // Cloudinary URL

            // Startup Specific KYC
            companyType: { type: String, enum: ["Private Ltd", "LLP", "Sole Proprietor"] },
            companyDoc: { type: String }, // Cloudinary URL
            registrationNumber: { type: String, trim: true },
            businessDescription: { type: String },
            coFounderEmails: [{ type: String, lowercase: true, trim: true }],

            // Investor Specific KYC
            pastInvestments: { type: String },
            submittedAt: { type: Date, default: null }
        },
        // Google OAuth tokens for Calendar/Meet integration
        googleTokens: {
            access_token: { type: String },
            refresh_token: { type: String },
            expiry_date: { type: Number },
            scope: { type: String },
            token_type: { type: String }
        },
        // Meeting Intelligence & Reliability
        reliabilityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 100,
        },
        meetingHistory: {
            totalMeetings: { type: Number, default: 0 },
            attendedMeetings: { type: Number, default: 0 },
            cancelledMeetings: { type: Number, default: 0 },
            rescheduledMeetings: { type: Number, default: 0 },
            noShows: { type: Number, default: 0 },
        }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
