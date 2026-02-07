// scripts/generate_embeddings.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { generateAllEmbeddings } from "../src/services/recommendationService.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/startupconnect";

async function main() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        const count = await generateAllEmbeddings();
        console.log(`Generated embeddings for ${count} profiles`);
        process.exit(0);
    } catch (err) {
        console.error("Error generating embeddings:", err);
        process.exit(1);
    }
}

main();
