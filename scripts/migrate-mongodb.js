require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const DATA_DIR = path.resolve(__dirname, '../packages/lib-database/data');
const COLLECTIONS = ['products', 'transactions', 'debts', 'categories', 'customers'];

const createModel = (name) => {
    const schema = new mongoose.Schema({
        id: { type: String, required: true, unique: true }
    }, { strict: false, versionKey: false });
    return mongoose.models[name] || mongoose.model(name, schema, name);
};

const Models = COLLECTIONS.reduce((acc, name) => {
    acc[name] = createModel(name);
    return acc;
}, {});

const migrate = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI found in .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'warungku' });
    console.log('✅ Connected to MongoDB Cloud');

    for (const collection of COLLECTIONS) {
        const filePath = path.join(DATA_DIR, `${collection}.json`);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (data.length > 0) {
                console.log(`Migrating ${data.length} records to [${collection}]...`);
                await Models[collection].deleteMany({});
                await Models[collection].insertMany(data);
            } else {
                console.log(`Skipping [${collection}] (0 items)`);
            }
        }
    }

    console.log('✅ Migration to Atlas complete!');
    process.exit(0);
};

migrate();
