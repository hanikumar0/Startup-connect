import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(process.cwd(), ".env") });

const ExternalProfileSchema = new mongoose.Schema({
    name: String,
    source: String,
    type: String,
});

const ExternalProfile = mongoose.model("ExternalProfile", ExternalProfileSchema, "externalprofiles");

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
        
        const count = await ExternalProfile.countDocuments({});
        console.log(`Total ExternalProfile records: ${count}`);
        
        const sources = await ExternalProfile.aggregate([
            { $group: { _id: "$source", count: { $sum: 1 } } }
        ]);
        console.log("Records by source:", sources);

        const types = await ExternalProfile.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);
        console.log("Records by type:", types);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
