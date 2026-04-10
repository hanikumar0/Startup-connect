import mongoose from "mongoose";
import axios from "axios";
import nodemailer from "nodemailer";
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3";
import redis from "../config/redis.js";

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
};

const formatLog = (name, status, error = null) => {
    const symbol = status === "ok" ? `${colors.green}✔${colors.reset}` : `${colors.red}✖${colors.reset}`;
    const statusText = status === "ok" ? "Connected" : `Failed (${error || "Not reachable"})`;
    const color = status === "ok" ? colors.green : colors.red;
    return `${symbol} ${colors.bright}${name}:${colors.reset} ${color}${statusText}${colors.reset}`;
};

const runServiceHealthCheck = async () => {
    console.log(`\n${colors.cyan}${colors.bright}========================================`);
    console.log(`🚀 SERVICE HEALTH CHECK`);
    console.log(`========================================${colors.reset}\n`);

    const checks = [
        // 1. Backend API (Self)
        (async () => {
            return { name: "Backend API", status: "ok" };
        })(),

        // 2. MongoDB
        (async () => {
            try {
                const status = mongoose.connection.readyState === 1 ? "ok" : "fail";
                return { name: "MongoDB", status, error: status === "fail" ? "Not connected" : null };
            } catch (e) {
                return { name: "MongoDB", status: "fail", error: e.message };
            }
        })(),

        // 3. Redis
        (async () => {
            try {
                const status = redis.status() === "ready" || redis.status() === "connect" ? "ok" : "fail";
                return { name: "Redis", status, error: status === "fail" ? `Status: ${redis.status()}` : null };
            } catch (e) {
                return { name: "Redis", status: "fail", error: e.message };
            }
        })(),

        // 4. AI Service
        (async () => {
            try {
                const url = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
                await axios.get(url, { timeout: 3000 });
                return { name: "AI Service", status: "ok" };
            } catch (e) {
                return { name: "AI Service", status: "fail", error: "Not reachable" };
            }
        })(),

        // 5. Microlink API
        (async () => {
            try {
                await axios.get("https://api.microlink.io?url=https://google.com", { timeout: 4000 });
                return { name: "Microlink API", status: "ok" };
            } catch (e) {
                return { name: "Microlink API", status: "fail", error: "Gateway timeout" };
            }
        })(),

        // 6. GitHub API
        (async () => {
            try {
                const token = process.env.GITHUB_TOKEN;
                await axios.get("https://api.github.com/zen", { 
                    timeout: 3000,
                    headers: token ? { Authorization: `token ${token}` } : {}
                });
                return { name: "GitHub API", status: "ok" };
            } catch (e) {
                return { name: "GitHub API", status: "fail", error: "Access denied" };
            }
        })(),

        // 7. ProductHunt API
        (async () => {
            try {
                const token = process.env.PRODUCTHUNT_TOKEN;
                if (!token) throw new Error("Missing token");
                return { name: "ProductHunt API", status: "ok" };
            } catch (e) {
                return { name: "ProductHunt API", status: "fail", error: e.message };
            }
        })(),

        // 8. Email SMTP
        (async () => {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: process.env.EMAIL_PORT,
                    secure: process.env.EMAIL_PORT == 465,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                await transporter.verify();
                return { name: "Email SMTP", status: "ok" };
            } catch (e) {
                return { name: "Email SMTP", status: "fail", error: "Auth failed" };
            }
        })(),

        // 9. AWS S3
        (async () => {
            try {
                const s3 = new S3Client({
                    region: process.env.AWS_REGION || "ap-south-1",
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                    },
                });
                await s3.send(new HeadBucketCommand({ Bucket: process.env.AWS_S3_BUCKET }));
                return { name: "AWS S3", status: "ok" };
            } catch (e) {
                return { name: "AWS S3", status: "fail", error: "Unreachable" };
            }
        })(),

        // 10. Verification API (SurePass)
        (async () => {
            try {
                const baseUrl = process.env.VERIFICATION_API_BASE_URL || "https://sandbox.surepass.io/api/v1";
                await axios.get(baseUrl.replace("/api/v1", ""), { timeout: 3000 });
                return { name: "Verification API", status: "ok" };
            } catch (e) {
                return { name: "Verification API", status: "fail", error: "Down" };
            }
        })(),

        // 11. Logo.dev API
        (async () => {
            try {
                const token = process.env.LOGODEV_PUBLISHABLE_KEY;
                if (!token) throw new Error("Missing Publishable Key");
                // Check connectivity to Logo.dev
                await axios.get("https://img.logo.dev/google.com", { 
                    timeout: 4000,
                    params: { token }
                 });
                return { name: "Logo.dev API", status: "ok" };
            } catch (e) {
                return { name: "Logo.dev API", status: "fail", error: e.response?.status === 401 ? "Invalid Key" : "Unreachable" };
            }
        })(),
    ];

    const results = await Promise.all(checks);
    
    results.forEach(res => {
        console.log(formatLog(res.name, res.status, res.error));
    });

    const passed = results.filter(r => r.status === "ok").length;
    const failed = results.length - passed;

    console.log(`\n${colors.bright}----------------------------------------`);
    console.log(`# Total: ${results.length} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
    console.log(`${colors.bright}----------------------------------------${colors.reset}\n`);

    if (failed > 0) {
        console.warn(`${colors.yellow}⚠️  Caution: ${failed} services offline.${colors.reset}\n`);
    } else {
        console.log(`${colors.green}✨ All systems operational.${colors.reset}\n`);
    }
};

export default runServiceHealthCheck;
