import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Investor from './src/models/Investor.js';
import Startup from './src/models/Startup.js';

dotenv.config({ path: '../.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
    const investorCount = await Investor.countDocuments();
    const startupCount = await Startup.countDocuments();
    const activeInvestors = await Investor.find({ isPublic: true }).limit(5);
    
    console.log({
        investorCount,
        startupCount,
        activeInvestors: activeInvestors.map(i => i.investorName)
    });
    process.exit(0);
}

check();
