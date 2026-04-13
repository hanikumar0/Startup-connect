import runServiceHealthCheck from "../utils/healthCheck.js";
import dotenv from "dotenv";
import mongoose from "mongoose";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await runServiceHealthCheck();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

start();
