import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let redis;
let isRedisAvailable = false;
let hasLoggedRedisError = false;

const MAX_RETRIES = 3;

try {
    // For Redis Cloud/Managed services, we often need TLS and better retry logic
    const options = {
        maxRetriesPerRequest: 1,
        retryStrategy(times) {
            if (times > MAX_RETRIES) {
                if (!hasLoggedRedisError) {
                    hasLoggedRedisError = true;
                    console.warn(`⚠️ Redis unavailable after ${MAX_RETRIES} retries — using fallback.`);
                }
                return null;
            }
            const delay = Math.min(times * 1000, 5000);
            if (times === 1) console.warn("🕒 Redis: Connection lost. Retrying...");
            return delay;
        },
        tls: REDIS_URL.startsWith("rediss://") ? {} : undefined,
        connectTimeout: 5000,
        lazyConnect: false,
    };

    redis = new Redis(REDIS_URL, options);

    redis.on("connect", () => {
        isRedisAvailable = true;
        hasLoggedRedisError = false;
        console.log("🚀 Redis connected successfully");
        // Force noeviction policy to prevent data loss of operational stats
        redis.config("SET", "maxmemory-policy", "noeviction").catch(() => {});
    });

    redis.on("error", (err) => {
        isRedisAvailable = false;
        if (!hasLoggedRedisError) {
            hasLoggedRedisError = true;
            console.warn("⚠️ Redis connection issue (using fallback):", err.message);
        }
        // Suppress repeated error logs
    });
} catch (error) {
    console.error("❌ Redis initialization failed:", error);
}

// In-memory fallback for OTPs if Redis is down
const memoryStorage = new Map();

const safeRedis = {
    get: async (key) => {
        if (isRedisAvailable) {
            try {
                return await redis.get(key);
            } catch (e) {
                return memoryStorage.get(key);
            }
        }
        return memoryStorage.get(key);
    },
    set: async (key, value, mode, duration) => {
        if (isRedisAvailable) {
            try {
                return await redis.set(key, value, mode, duration);
            } catch (e) {
                memoryStorage.set(key, value);
                if (duration) setTimeout(() => memoryStorage.delete(key), duration * 1000);
                return "OK";
            }
        }
        memoryStorage.set(key, value);
        if (duration) setTimeout(() => memoryStorage.delete(key), duration * 1000);
        return "OK";
    },
    del: async (key) => {
        if (isRedisAvailable) {
            try {
                return await redis.del(key);
            } catch (e) {
                return memoryStorage.delete(key);
            }
        }
        return memoryStorage.delete(key);
    },
    // Add other methods as needed or return the raw instance
    on: (event, cb) => redis?.on(event, cb),
    status: () => redis?.status || "disconnected"
};

export default safeRedis;

