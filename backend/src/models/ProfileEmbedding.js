// src/models/ProfileEmbedding.js
import mongoose from "mongoose";

const profileEmbeddingSchema = new mongoose.Schema(
    {
        profileId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        profileType: { type: String, enum: ["investor", "startup"], required: true },
        embedding: { type: [Number], required: true },
    },
    { timestamps: true }
);

export default mongoose.model("ProfileEmbedding", profileEmbeddingSchema);
