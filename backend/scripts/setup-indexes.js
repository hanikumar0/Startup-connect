/**
 * Database Index Setup Script
 * Run once before deploying to production:
 *   node scripts/setup-indexes.js
 */
import "../src/config/env.js";
import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

async function setupIndexes() {
    console.log("🔧 Setting up database indexes...\n");

    try {
        await mongoose.connect(MONGO_URI, {
            dbName: "startup_connect",
            tls: true,
            serverSelectionTimeoutMS: 10000,
            family: 4,
        });
        console.log("✅ Connected to MongoDB\n");

        const db = mongoose.connection.db;

        // ─── User Indexes ───
        console.log("📋 Creating User indexes...");
        await db.collection("users").createIndex({ email: 1 }, { unique: true });
        await db.collection("users").createIndex({ phone: 1 }, { unique: true, sparse: true });
        await db.collection("users").createIndex({ role: 1 });
        await db.collection("users").createIndex({ verificationStatus: 1 });
        await db.collection("users").createIndex({ createdAt: -1 });

        // ─── Message Indexes ───
        console.log("📋 Creating Message indexes...");
        await db.collection("messages").createIndex({ conversationId: 1, createdAt: -1 });
        await db.collection("messages").createIndex({ senderId: 1, createdAt: -1 });
        await db.collection("messages").createIndex({ receiverId: 1, isRead: 1 });

        // ─── Connection Indexes ───
        console.log("📋 Creating Connection indexes...");
        await db.collection("connections").createIndex({ sender: 1, recipient: 1 }, { unique: true });
        await db.collection("connections").createIndex({ recipient: 1, status: 1 });
        await db.collection("connections").createIndex({ sender: 1, status: 1 });

        // ─── Notification Indexes ───
        console.log("📋 Creating Notification indexes...");
        await db.collection("notifications").createIndex({ recipient: 1, createdAt: -1 });
        await db.collection("notifications").createIndex({ recipient: 1, isRead: 1 });

        // ─── Profile Indexes ───
        console.log("📋 Creating Profile indexes...");
        await db.collection("startupprofiles").createIndex({ userId: 1 }, { unique: true });
        await db.collection("startupprofiles").createIndex({ industry: 1 });
        await db.collection("investorprofiles").createIndex({ userId: 1 }, { unique: true });
        await db.collection("investorprofiles").createIndex({ industries: 1 });

        // ─── VDR Document Indexes ───
        console.log("📋 Creating VDR indexes...");
        await db.collection("vdrdocuments").createIndex({ owner: 1 });

        // ─── Deal Indexes ───
        console.log("📋 Creating Deal indexes...");
        await db.collection("deals").createIndex({ startup: 1, investor: 1 });
        await db.collection("deals").createIndex({ stage: 1 });

        // ─── Meeting Indexes ───
        console.log("📋 Creating Meeting indexes...");
        await db.collection("meetings").createIndex({ initiatorId: 1 });
        await db.collection("meetings").createIndex({ guestId: 1 });
        await db.collection("meetings").createIndex({ roomId: 1 }, { unique: true });
        await db.collection("meetings").createIndex({ startTime: 1 });

        // ─── Profile Embedding Indexes ───
        console.log("📋 Creating Embedding indexes...");
        await db.collection("profileembeddings").createIndex({ profileId: 1 }, { unique: true });

        console.log("\n✅ All indexes created successfully!");

        // List all indexes
        const collections = ["users", "messages", "connections", "notifications", "startupprofiles", "investorprofiles", "vdrdocuments", "deals", "meetings"];
        for (const coll of collections) {
            try {
                const indexes = await db.collection(coll).indexes();
                console.log(`\n${coll}: ${indexes.length} indexes`);
                indexes.forEach(idx => console.log(`  - ${JSON.stringify(idx.key)}`));
            } catch (e) {
                // Collection might not exist yet
            }
        }

    } catch (error) {
        console.error("❌ Index setup failed:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
        process.exit(0);
    }
}

setupIndexes();
