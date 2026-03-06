import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '../.env') });

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({}), 'users');
        const Deal = mongoose.model('Deal', new mongoose.Schema({}), 'deals');

        const userCount = await User.countDocuments();
        const dealCount = await Deal.countDocuments();

        console.log(`Users: ${userCount}`);
        console.log(`Deals: ${dealCount}`);

        const users = await User.find().limit(5);
        console.log('Recent Users:', JSON.stringify(users, null, 2));

        const deals = await Deal.find().limit(5);
        console.log('Recent Deals:', JSON.stringify(deals, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
