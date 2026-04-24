
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// .env is in the root: c:\startup connect
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const MarketIntelligenceSchema = new mongoose.Schema({
    type: String,
    status: String,
    title: String
});

const MarketIntelligence = mongoose.model('MarketIntelligence', MarketIntelligenceSchema, 'marketintelligences');

async function checkCounts() {
    try {
        console.log('Using MONGO_URI:', process.env.MONGO_URI ? 'FOUND' : 'NOT FOUND');
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is missing');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const types = ['news', 'event', 'workshop', 'grant', 'trend'];
        for (const type of types) {
            const count = await MarketIntelligence.countDocuments({ type, status: 'active' });
            const totalCount = await MarketIntelligence.countDocuments({ type });
            console.log(`Type: ${type} | Active: ${count} | Total: ${totalCount}`);
            
            if (count === 0 && totalCount > 0) {
                 const sample = await MarketIntelligence.findOne({ type }).select('status');
                 console.log(`  Sample status for ${type}: ${sample?.status}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCounts();
