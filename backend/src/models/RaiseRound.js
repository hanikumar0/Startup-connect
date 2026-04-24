import mongoose from "mongoose";

const RaiseRoundSchema = new mongoose.Schema({
    startupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    roundType: {
        type: String,
        enum: ['pre-seed', 'seed', 'bridge', 'series-a', 'series-b+'],
        required: true
    },
    targetAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    minTicketSize: {
        type: Number
    },
    maxTicketSize: {
        type: Number
    },
    valuationRange: {
        type: String
    },
    targetCloseDate: {
        type: Date
    },
    useOfFunds: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'closed', 'paused'],
        default: 'draft'
    },
    visibility: {
        type: String,
        enum: ['public', 'matches_only', 'private'],
        default: 'matches_only'
    },
    softCommittedAmount: {
        type: Number,
        default: 0
    },
    hardCommittedAmount: {
        type: Number,
        default: 0
    },
    commitments: [{
        investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        type: { type: String, enum: ['soft', 'hard', 'verbal'] },
        status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'confirmed' },
        updatedAt: { type: Date, default: Date.now }
    }],
    aiInsights: {
        likelyCloseDate: Date,
        closingRisk: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        suggestions: [String]
    }
}, {
    timestamps: true
});

// Virtual for total progress
RaiseRoundSchema.virtual('totalCommitted').get(function() {
    return this.softCommittedAmount + this.hardCommittedAmount;
});

RaiseRoundSchema.virtual('progressPercentage').get(function() {
    if (!this.targetAmount) return 0;
    return Math.min(100, ((this.softCommittedAmount + this.hardCommittedAmount) / this.targetAmount) * 100);
});

RaiseRoundSchema.set('toJSON', { virtuals: true });
RaiseRoundSchema.set('toObject', { virtuals: true });

const RaiseRound = mongoose.model('RaiseRound', RaiseRoundSchema);

export default RaiseRound;
