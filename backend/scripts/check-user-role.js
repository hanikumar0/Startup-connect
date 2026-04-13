import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";

dotenv.config({ path: ".env" });

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        const user = await User.findOne({ name: /hani kumar/i });
        console.log("Found User:", JSON.stringify(user, null, 2));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
checkUser();
