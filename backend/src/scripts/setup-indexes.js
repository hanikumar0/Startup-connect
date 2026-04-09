import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";
import Notification from "../models/Notification.js";
import Event from "../models/Event.js";

dotenv.config();

const setupIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Strategic alignment with database established.");

        // User Indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ role: 1 });

        // Startup Indexes
        await Startup.collection.createIndex({ startupName: "text", tagline: "text", industry: "text" });
        await Startup.collection.createIndex({ industry: 1 });
        await Startup.collection.createIndex({ stage: 1 });
        await Startup.collection.createIndex({ location: 1 });

        // Investor Indexes
        await Investor.collection.createIndex({ investorName: "text", bio: "text", industry: "text" });
        await Investor.collection.createIndex({ investorType: 1 });
        await Investor.collection.createIndex({ "investmentFocus.industries": 1 });

        // Notification Indexes
        await Notification.collection.createIndex({ userId: 1, createdAt: -1 });
        await Notification.collection.createIndex({ isRead: 1 });

        // Event/Analytics Indexes
        await Event.collection.createIndex({ type: 1, createdAt: -1 });
        await Event.collection.createIndex({ targetId: 1 });

        console.log("Database indexing vectors successfully calibrated.");
        process.exit(0);
    } catch (error) {
        console.error("Indexing protocol failure:", error);
        process.exit(1);
    }
};

setupIndexes();
