// packages/lib-database/src/index.js
// @warungku/lib-database
// JSON file-based database engine.
// Provides: read, write, findById, findAll, insert, update, remove
// Each collection maps to a JSON file in /data

'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');

// ─── Low-level helpers ────────────────────────────────────────────────────────

/**
 * Read a JSON collection file and return its array.
 * @param {string} collection  e.g. 'products'
 * @returns {Array}
 */
const read = (collection) => {
  const file = path.join(DATA_DIR, `${collection}.json`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]', 'utf8');
    return [];
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};

/**
 * Write an array back to the JSON collection file.
 * @param {string} collection
 * @param {Array}  data
 */
const write = (collection, data) => {
  const file = path.join(DATA_DIR, `${collection}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// ─── Query helpers ────────────────────────────────────────────────────────────

/**
 * Find all records, with optional predicate filter and sort.
 */
const findAll = (collection, { filter = null, sortBy = null, order = 'asc' } = {}) => {
  let data = read(collection);
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

/**
 * Find one record by id.
 */
const findById = (collection, id) => {
  return read(collection).find((r) => r.id === id) || null;
};

/**
 * Insert a new record.
 */
const insert = (collection, record) => {
  const data = read(collection);
  data.push(record);
  write(collection, data);
  return record;
};

/**
 * Update a record by id — merges partial fields.
 */
const update = (collection, id, partial) => {
  const data = read(collection);
  const index = data.findIndex((r) => r.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...partial, updatedAt: new Date().toISOString() };
  write(collection, data);
  return data[index];
};

/**
 * Remove a record by id.
 */
const remove = (collection, id) => {
  const data = read(collection);
  const record = data.find((r) => r.id === id);
  if (!record) return null;
  write(collection, data.filter((r) => r.id !== id));
  return record;
};

/**
 * Run multiple operations atomically (synchronous "transaction").
 * @param {Function} fn  receives { read, write, findById, insert, update, remove }
 */
const atomic = (fn) => fn({ read, write, findById, insert, update, remove, findAll });

// ─── Collection names (constants) ────────────────────────────────────────────
const COLLECTIONS = Object.freeze({
  PRODUCTS: 'products',
  TRANSACTIONS: 'transactions',
  DEBTS: 'debts',
  CATEGORIES: 'categories',
  CUSTOMERS: 'customers',
});

module.exports = { read, write, findAll, findById, insert, update, remove, atomic, COLLECTIONS };
