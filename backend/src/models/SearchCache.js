import mongoose from "mongoose";

const searchCacheSchema = new mongoose.Schema({
    keyword: { type: String, required: true, trim: true },
    normalizedKeyword: { type: String, required: true, unique: true, lowercase: true, trim: true },
    results: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MarketIntelligence' }],
    sourceSummary: {
        meetup: Number,
        eventbrite: Number,
        startupindia: Number
    },
    hitCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } } // TTL Index
}, { timestamps: true });

const SearchCache = mongoose.model("SearchCache", searchCacheSchema);
export default SearchCache;
