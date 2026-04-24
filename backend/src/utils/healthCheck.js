import mongoose from "mongoose";
import axios from "axios";
import nodemailer from "nodemailer";
import { checkS3Connection } from "./s3.js";
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
    let color = colors.green;
    let symbol = `✔`;
    let statusLabel = "Working";

    if (status === "fail") {
        color = colors.red;
        symbol = `✖`;
        statusLabel = `Failed (${error || "Offline"})`;
    } else if (status === "warn") {
        color = colors.yellow;
        symbol = `⚠️`;
        statusLabel = `Warning (${error || "Config missing"})`;
    }

    return `${color}${symbol}${colors.reset} ${colors.bright}${name.padEnd(18)}${colors.reset} ${color}${statusLabel}${colors.reset}`;
};

const runServiceHealthCheck = async () => {
    console.log(`\n${colors.cyan}${colors.bright}========================================`);
    console.log(`🚀 STARTUP CONNECT - SYSTEM HEALTH`);
    console.log(`========================================${colors.reset}\n`);

    const checks = [
        // Core
        (async () => {
            try {
                const status = mongoose.connection.readyState === 1 ? "ok" : "fail";
                return { name: "MongoDB", status, error: status === "fail" ? "Not connected" : null };
            } catch (e) { return { name: "MongoDB", status: "fail", error: e.message }; }
        })(),
        (async () => {
            try {
                const status = redis.status() === "ready" || redis.status() === "connect" ? "ok" : "fail";
                if (status === "fail") return { name: "Redis", status, error: `Status: ${redis.status()}` };
                
                // Try to get eviction policy if connected
                let policy = "unknown";
                if (status === "ok") {
                    try {
                        const rawRedis = await import("../config/redis.js"); // Need access to the ioredis instance
                        // Note: Our safeRedis doesn't expose all ioredis methods, but we can verify the status
                        // If we had the raw client, we would run: const info = await redis.info('memory');
                        // For now we assume its okay if connection is up or we rely on docker-compose settings.
                    } catch (e) {}
                }
                return { name: "Redis", status: "ok" };
            } catch (e) { return { name: "Redis", status: "fail", error: e.message }; }
        })(),

        // External APIs
        (async () => {
            try {
                const token = process.env.GITHUB_TOKEN;
                if (!token) return { name: "GitHub API", status: "warn", error: "Missing token" };
                await axios.get("https://api.github.com/zen", { timeout: 3000, headers: { Authorization: `token ${token}` } });
                return { name: "GitHub API", status: "ok" };
            } catch (e) { return { name: "GitHub API", status: "fail", error: "Connection error" }; }
        })(),
        (async () => {
            try {
                const token = process.env.PRODUCTHUNT_TOKEN;
                if (!token) return { name: "ProductHunt", status: "warn", error: "Missing token" };
                return { name: "ProductHunt", status: "ok" };
            } catch (e) { return { name: "ProductHunt", status: "fail", error: e.message }; }
        })(),
        (async () => {
            try {
                const key = process.env.SERP_API_KEY;
                if (!key) return { name: "SerpAPI", status: "warn", error: "Missing key" };
                await axios.get(`https://serpapi.com/account?api_key=${key}`, { timeout: 3000 });
                return { name: "SerpAPI", status: "ok" };
            } catch (e) { return { name: "SerpAPI", status: "fail", error: "Invalid Key / Down" }; }
        })(),
        (async () => {
            try {
                const key = process.env.EVENTBRITE_API_KEY;
                if (!key) return { name: "Eventbrite", status: "warn", error: "Missing key" };
                return { name: "Eventbrite", status: "ok" };
            } catch (e) { return { name: "Eventbrite", status: "fail", error: "Invalid Key" }; }
        })(),

        // Infrastructure
        (async () => {
            const res = await checkS3Connection();
            return { name: "AWS S3", status: res.status, error: res.message };
        })(),
        (async () => {
            try {
                const { v2: cloudinary } = await import("cloudinary");
                if (!process.env.CLOUD_NAME) return { name: "Cloudinary", status: "warn" };
                cloudinary.config({ cloud_name: process.env.CLOUD_NAME, api_key: process.env.API_KEY, api_secret: process.env.API_SECRET });
                await cloudinary.api.ping();
                return { name: "Cloudinary", status: "ok" };
            } catch (e) { return { name: "Cloudinary", status: "fail" }; }
        })(),
        (async () => {
            try {
                if (!process.env.EMAIL_HOST) return { name: "SMTP (Gmail)", status: "warn" };
                const transporter = nodemailer.createTransport({ host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, secure: true, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
                await transporter.verify();
                return { name: "SMTP (Gmail)", status: "ok" };
            } catch (e) { return { name: "SMTP (Gmail)", status: "fail" }; }
        })(),

        // Intelligence
        (async () => {
            try {
                const url = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
                await axios.get(url, { timeout: 2000 });
                return { name: "AI Service", status: "ok" };
            } catch (e) { return { name: "AI Service", status: "fail" }; }
        })(),
    ];

    const results = await Promise.all(checks);
    results.forEach(res => console.log(formatLog(res.name, res.status, res.error)));

    const failed = results.filter(r => r.status === "fail").length;
    const warns = results.filter(r => r.status === "warn").length;

    console.log(`\n${colors.bright}----------------------------------------`);
    console.log(`Status Summary: ${failed === 0 ? colors.green + "HEALTHY" : colors.red + "ISSUES"} | Warnings: ${warns}`);
    console.log(`----------------------------------------${colors.reset}\n`);

    await runIngestionAudit();
};

const runIngestionAudit = async () => {
    try {
        const ExternalProfile = mongoose.model("ExternalProfile");
        const MarketIntelligence = mongoose.model("MarketIntelligence");
        
        const phCount = await ExternalProfile.countDocuments({ source: "producthunt" });
        const ghCount = await ExternalProfile.countDocuments({ source: "github" });
        const intelCount = await MarketIntelligence.countDocuments({});
        const logoEnriched = await ExternalProfile.countDocuments({ logo: { $exists: true, $ne: "" } });

        console.log(`${colors.cyan}${colors.bright}========================================`);
        console.log(`📊 INGESTION SUMMARY (LIVE DB)`);
        console.log(`========================================${colors.reset}`);
        console.log(`${colors.bright}Market Intelligence:${colors.reset} ${colors.green}${intelCount}${colors.reset}`);
        console.log(`${colors.bright}Product Hunt:${colors.reset}        ${colors.green}${phCount}${colors.reset}`);
        console.log(`${colors.bright}GitHub Profiles:${colors.reset}     ${colors.green}${ghCount}${colors.reset}`);
        console.log(`${colors.bright}Logo.dev Enriched:${colors.reset}   ${colors.green}${logoEnriched}${colors.reset}`);
        console.log(`${colors.cyan}${colors.bright}========================================${colors.reset}\n`);
    } catch (e) {}
};

export default runServiceHealthCheck;
