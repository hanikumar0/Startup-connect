
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const MarketIntelligenceSchema = new mongoose.Schema({
    type: String,
    status: String,
    title: String,
    source: String
}, { strict: false });

const MarketIntelligence = mongoose.model('MarketIntelligence', MarketIntelligenceSchema, 'marketintelligences');

async function checkDetails() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const types = ['workshop', 'grant', 'trend'];
        for (const type of types) {
            const items = await MarketIntelligence.find({ type });
            console.log(`Type: ${type} | Count: ${items.length}`);
            items.forEach(i => console.log(` - Title: ${i.title} | Status: ${i.status} | ID: ${i._id}`));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDetails();
