
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const marketIntelligenceSchema = new mongoose.Schema(
    {
        title: String,
        summary: String,
        type: String,
        status: String,
    },
    { strict: false }
);

const MarketIntelligence = mongoose.model("MarketIntelligence", marketIntelligenceSchema, 'marketintelligences');

async function testQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        console.log('--- Testing Query for Workshop ---');
        const type = "workshop";
        const query = { status: "active", type };
        console.log('Query:', JSON.stringify(query));
        
        const items = await MarketIntelligence.find(query);
        console.log('Found Count:', items.length);
        items.forEach(i => console.log(` - ${i.title}`));

        console.log('\n--- All Active Items Count ---');
        const count = await MarketIntelligence.countDocuments({ status: "active" });
        console.log('Total Active:', count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testQuery();
