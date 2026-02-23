// packages/lib-database/src/index.js
// @warungku/lib-database
// MongoDB Mongoose-based database engine.
// Provides: read, write, findById, findAll, insert, update, remove (now async)

'use strict';

const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../../.env') });

const COLLECTIONS = Object.freeze({
  PRODUCTS: 'products',
  TRANSACTIONS: 'transactions',
  DEBTS: 'debts',
  CATEGORIES: 'categories',
  CUSTOMERS: 'customers',
});

// Create connection (Singleton)
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    console.warn('WARN: MONGODB_URI is not set!');
    return;
  }
  // If already connecting, wait for that promise
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'warungku',
    serverSelectionTimeoutMS: 5000, // 5 seconds timeout for server selection
    connectTimeoutMS: 8000,          // 8 seconds connection timeout
    socketTimeoutMS: 10000,          // 10 seconds socket timeout
    maxPoolSize: 10,
    bufferCommands: false,
  }).then(() => {
    isConnected = true;
    connectionPromise = null;
    console.log('✅ MongoDB Connected to Atlas');
  }).catch(err => {
    connectionPromise = null;
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  });

  return connectionPromise;
};
// NOTE: Do NOT call connectDB() at module level in Serverless environments.
// Connection will be established lazily on first query per request.

// Dynamic Schema with strict:false to allow JSON exact match
const createModel = (name) => {
  const schema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }
  }, { strict: false, versionKey: false });

  // Transform output to remove internal _id
  schema.set('toJSON', {
    transform: function (doc, ret) { delete ret._id; return ret; }
  });

  return mongoose.models[name] || mongoose.model(name, schema, name); // third param forces exact collection name
};

const Models = {
  [COLLECTIONS.PRODUCTS]: createModel(COLLECTIONS.PRODUCTS),
  [COLLECTIONS.TRANSACTIONS]: createModel(COLLECTIONS.TRANSACTIONS),
  [COLLECTIONS.DEBTS]: createModel(COLLECTIONS.DEBTS),
  [COLLECTIONS.CATEGORIES]: createModel(COLLECTIONS.CATEGORIES),
  [COLLECTIONS.CUSTOMERS]: createModel(COLLECTIONS.CUSTOMERS),
};

// ─── Query helpers (Async) ───────────────────────────────────────────────────

const read = async (collection) => {
  await connectDB();
  const docs = await Models[collection].find({}).lean();
  return docs.map(d => { delete d._id; return d; });
};

// write is mostly used for bulk reset/migration now
const write = async (collection, data) => {
  await connectDB();
  await Models[collection].deleteMany({});
  if (data && data.length > 0) {
    await Models[collection].insertMany(data);
  }
};

const findAll = async (collection, { filter = null, sortBy = null, order = 'asc' } = {}) => {
  let data = await read(collection);
  if (filter) data = data.filter(filter);
  if (sortBy) {
    data = [...data].sort((a, b) => {
      const va = typeof a[sortBy] === 'string' ? a[sortBy].toLowerCase() : a[sortBy];
      const vb = typeof b[sortBy] === 'string' ? b[sortBy].toLowerCase() : b[sortBy];
      if (va < vb) return order === 'asc' ? -1 : 1;
      if (va > vb) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
  return data;
};

const findById = async (collection, id) => {
  await connectDB();
  const doc = await Models[collection].findOne({ id }).lean();
  if (doc) delete doc._id;
  return doc || null;
};

const insert = async (collection, record) => {
  await connectDB();
  await Models[collection].create(record);
  return record;
};

const update = async (collection, id, partial) => {
  await connectDB();
  const updatedAt = new Date().toISOString();
  const doc = await Models[collection].findOneAndUpdate(
    { id },
    { $set: { ...partial, updatedAt } },
    { new: true, lean: true }
  );
  if (doc) delete doc._id;
  return doc || null;
};

const remove = async (collection, id) => {
  await connectDB();
  const doc = await Models[collection].findOneAndDelete({ id }).lean();
  if (doc) delete doc._id;
  return doc || null;
};

// Provides an interface for atomic operations.
// Note: Actual MongoDB transactions require replica sets. 
// For this rewrite, we will run the provided async function context.
const atomic = async (fn) => {
  return await fn({ read, write, findById, insert, update, remove, findAll });
};

module.exports = { connectDB, read, write, findAll, findById, insert, update, remove, atomic, COLLECTIONS };
