import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
dotenv.config({ path: '../.env' });
import mongoose from 'mongoose';
import csvParser from 'csv-parser';
import ExternalProfile from '../src/models/ExternalProfile.js';

const processCSV = async () => {
    console.log("Starting Strategic CSV Importer...");
    
    try {
        if (!process.env.MONGO_URI) {
            console.error("Missing MONGO_URI in environment.");
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGO_URI, { dbName: "startup_connect" });
        console.log("Connected to MongoDB.");

        const potentialPaths = [
            { path: path.join(process.cwd(), 'leads.csv'), source: 'csv' },
            { path: path.join(process.cwd(), 'investors_raw.csv'), source: 'investors_raw' },
            { path: path.join(process.cwd(), '..', '.agent', 'scratch', 'investors_raw.csv'), source: 'investors_raw' }
        ];

        const existingFiles = potentialPaths.filter(f => fs.existsSync(f.path));

        if (existingFiles.length === 0) {
            console.error(`\nERROR: No CSV source files found.`);
            console.log("Looked in:");
            potentialPaths.forEach(p => console.log(` - ${p.path}`));
            process.exit(1);
        }

        for (const fileObj of existingFiles) {
            const fileName = path.basename(fileObj.path);
            console.log(`\n--- Processing ${fileName} (source: ${fileObj.source}) ---`);
            
            const fileResults = [];
            const stream = fs.createReadStream(fileObj.path).pipe(csvParser());

            for await (const data of stream) {
                const name = data['Investor name'] || data['Name'] || "";
                const website = data['Website'] || "";
                const location = data['Global HQ'] || data['Location'] || "Not specified";
                const countries = data['Countries of investment'] ? data['Countries of investment'].split(',').map(c => c.trim()) : [];
                const stage = data['Stage of investment'] || "Any";
                const description = data['Investment thesis'] || "Not specified";
                const invType = data['Investor type'] || "VC";
                const minCheck = data['First cheque minimum'] || "Not specified";
                const maxCheck = data['First cheque maximum'] || "Not specified";
                
                if (name && name.trim() !== "") {
                    fileResults.push({
                        name: name.trim(),
                        firm: name.trim(),
                        website: website.trim(),
                        location: location.trim(),
                        countries: countries,
                        stage: stage.trim(),
                        description: description.trim(),
                        investor_type: invType.trim(),
                        min_check: minCheck.trim(),
                        max_check: maxCheck.trim(),
                        industry: "Venture Capital",
                        // FORCE TYPE AND SOURCE PER REQUIREMENT
                        source: fileObj.source,
                        type: "investor",
                        leadType: "investor",
                        role: "investor",
                        isExternal: true,
                        metadata: {
                            originalData: data,
                            logo: website ? (() => {
                                try { return `https://img.logo.dev/${new URL(website).hostname}?token=${process.env.LOGODEV_PUBLISHABLE_KEY}`; }
                                catch(e) { return null; }
                            })() : null
                        }
                    });
                }
            }

            console.log(`Parsed ${fileResults.length} records.`);

            let added = 0;
            let updated = 0;

            for (const profile of fileResults) {
                try {
                    const existing = await ExternalProfile.findOne({ name: profile.name, source: profile.source });
                    if (existing) {
                        await ExternalProfile.updateOne({ _id: existing._id }, { $set: profile });
                        updated++;
                    } else {
                        await ExternalProfile.create(profile);
                        added++;
                    }
                } catch (err) {
                    console.error(`Error saving ${profile.name}:`, err.message);
                }
            }
            console.log(`Finished ${fileName}: Added ${added}, Updated ${updated}.\n`);
        }

        const total = await ExternalProfile.countDocuments();
        const investorsRawCount = await ExternalProfile.countDocuments({ source: "investors_raw" });
        const filtered = await ExternalProfile.countDocuments({ type: "investor" });

        console.log(`========================================`);
        console.log(`Total: ${total}`);
        console.log(`Source investors_raw: ${investorsRawCount}`);
        console.log(`Filtered: ${filtered}`);
        console.log(`========================================`);

        console.log(`\n✅ Strategic Batch Import Complete!`);
        mongoose.connection.close();

    } catch (err) {
        console.error("Critical Processing Error:", err);
        process.exit(1);
    }
};

processCSV();
