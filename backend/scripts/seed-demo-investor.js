import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Investor from "../src/models/Investor.js";
import Startup from "../src/models/Startup.js";
import Connection from "../src/models/Connection.js";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

async function seedDemoInvestor() {
  try {
    console.log("🚀 Starting demo investor seeding...");
    await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });

    // 1. Find Hanikumar
    const hani = await User.findOne({ email: "hanikumar064@gmail.com" });
    if (!hani) {
      console.error("❌ Hanikumar not found! Email: hanikumar064@gmail.com");
      return;
    }
    console.log(`✅ Found startup owner: ${hani.name} (${hani._id})`);

    // Ensure Hanikumar has a startup profile
    let haniProfile = await Startup.findOne({ userId: hani._id });
    if (!haniProfile) {
      console.log("Creating basic startup profile for Hanikumar...");
      haniProfile = await Startup.create({
        userId: hani._id,
        startupName: "Hani's Startup",
        description: "Innovative startup by Hanikumar",
        industry: "AI",
        stage: "seed",
        location: "India",
        status: "approved",
        isVerified: true
      });
    }

    // 2. Create Rahul Mehta
    const rahulEmail = "investor.demo@startupconnect.com";
    let rahul = await User.findOne({ email: rahulEmail });
    
    if (rahul) {
      console.log("Rahul Mehta already exists, resetting...");
      await Investor.deleteOne({ userId: rahul._id });
      await Connection.deleteMany({ $or: [{ sender: rahul._id }, { recipient: rahul._id }] });
      const hashedPassword = await bcrypt.hash("Demo@123", 10);
      rahul.password = hashedPassword;
      rahul.name = "Rahul Mehta";
      rahul.role = "investor";
      rahul.onboardingCompleted = true;
      rahul.isVerified = true;
      await rahul.save();
    } else {
      const hashedPassword = await bcrypt.hash("Demo@123", 10);
      rahul = await User.create({
        name: "Rahul Mehta",
        email: rahulEmail,
        password: hashedPassword,
        role: "investor",
        isVerified: true,
        onboardingCompleted: true
      });
      console.log(`✅ Created Rahul Mehta User (${rahul._id})`);
    }

    // 3. Create Investor Profile for Rahul
    const investorProfile = await Investor.create({
      userId: rahul._id,
      investorName: "Rahul Mehta",
      firmName: "Elevate Ventures",
      investorType: "Angel",
      bio: "Angel investor focused on AI and SaaS startups",
      location: "India",
      checkSizeMin: 25000,
      checkSizeMax: 100000,
      preferredStages: ["Pre-seed", "Seed"],
      preferredIndustries: ["AI", "SaaS"],
      status: "approved",
      isVerified: true,
      onboardingCompleted: true
    });
    console.log(`✅ Created Rahul Mehta Investor Profile (${investorProfile._id})`);

    // 4. Create Match Record (so it shows up in dashboard recommendations)
    const match = await (await import("../src/models/Match.js")).default.create({
      startupId: haniProfile._id,
      investorId: investorProfile._id,
      score: 98,
      reasons: [
        "Strong alignment with AI/SaaS thesis",
        "Target ticket size matches current raise",
        "Geographic preference (India) overlap"
      ],
      status: "CONNECTED"
    });
    console.log(`✅ Created Match record (${match._id})`);

    // 5. Create Connection
    const connection = await Connection.create({
      sender: rahul._id,
      recipient: hani._id,
      status: "ACCEPTED"
    });
    console.log(`✅ Created Connection between Rahul and Hanikumar (${connection._id})`);

    console.log("\n🎉 Demo seeding completed successfully!");
    console.log("Credentials:");
    console.log("Email: investor.demo@startupconnect.com");
    console.log("Password: Demo@123");

  } catch (error) {
    console.error("❌ ERROR seeding demo investor:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDemoInvestor();
