import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Point to the root .env file which is 2 levels up from backend/src/config/env.js
dotenv.config({ path: path.join(__dirname, "../../../.env") });

console.log("✅ Environment variables loaded from root .env");
