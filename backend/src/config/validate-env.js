import { z } from "zod";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("5000"),
    MONGO_URI: z.string().url("MONGO_URI protocol mismatch detected."),
    JWT_SECRET: z.string().min(32, "JWT entropy below institutional thresholds."),
    FRONTEND_URL: z.string().url().default("http://localhost:3000"),
    REDIS_URL: z.string().optional(),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
});

export const validateEnvironment = () => {
    try {
        envSchema.parse(process.env);
        logger.info("Environment protocol validation: SUCCESS");
    } catch (e) {
        logger.error("Environment Protocol Violation: CRITICAL FAILURE");
        console.error(e.errors);
        process.exit(1);
    }
};
