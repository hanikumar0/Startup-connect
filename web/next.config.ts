import type { NextConfig } from "next";
import path from "path";
import dotenv from "dotenv";

// Load root .env
dotenv.config({ path: path.join(__dirname, "../.env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
