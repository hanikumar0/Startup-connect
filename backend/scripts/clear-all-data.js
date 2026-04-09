import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // Adjusted path for running from root or backend
// Try both just in case
dotenv.config({ path: '../.env' });

async function clearData() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error('MONGO_URI is not defined in environment');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const collections = [
            'users',
            'startupprofiles',
            'investorprofiles',
            'deals',
            'connections',
            'meetings',
            'messages',
            'notifications',
            'profileembeddings',
            'vdrdocuments'
        ];

        for (const col of collections) {
            try {
                await mongoose.connection.db.collection(col).deleteMany({});
                console.log(`Cleared collection: ${col}`);
            } catch (err) {
                console.log(`Collection ${col} not found or error clearing:`, err.message);
            }
        }

        console.log('All demo data removed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to clear data:', err);
        process.exit(1);
    }
}

clearData();
