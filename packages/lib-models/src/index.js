// packages/lib-models/src/index.js
// @warungku/lib-models
// Domain model factories — define shape and defaults for every entity.
// These are plain-object factories (not classes), making them serializable to JSON.

'use strict';

const { v4: uuid } = require('uuid');

// ─── Product Model ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Product
 * @property {string}  id
 * @property {string}  name
 * @property {string}  category
 * @property {number}  price
 * @property {number}  stock
 * @property {string}  createdAt  ISO timestamp
 * @property {string}  updatedAt  ISO timestamp
 */

const createProduct = ({ name, category, price, stock }) => ({
  id: uuid(),
  name: String(name).trim(),
  category: String(category).trim(),
  price: Number(price),
  stock: Number(stock),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// ─── TransactionItem Model ────────────────────────────────────────────────────

/**
 * @typedef {Object} TransactionItem
 * @property {string}  productId
 * @property {string}  name
 * @property {number}  price
 * @property {number}  qty
 * @property {number}  subtotal
 */

const createTransactionItem = ({ productId, name, price, qty }) => ({
  productId,
  name: String(name),
  price: Number(price),
  qty: Number(qty),
  subtotal: Number(price) * Number(qty),
});

// ─── Transaction Model ────────────────────────────────────────────────────────

/**
 * @typedef {Object} Transaction
 * @property {string}             id
 * @property {'SALE'|'DEBT_PAYMENT'} type
 * @property {TransactionItem[]}  items
 * @property {number}             total
 * @property {number}             amountPaid
 * @property {number}             change
 * @property {string}             note
 * @property {string}             createdAt
 */

const createTransaction = ({ type = 'SALE', items, total, amountPaid, change, note = '', discount = 0, paymentMethod = 'CASH' }) => ({
  id: uuid(),
  type,
  items,
  discount: Number(discount),
  total: Number(total),
  amountPaid: Number(amountPaid),
  change: Number(change),
  paymentMethod: String(paymentMethod).toUpperCase(),
  note: String(note),
  createdAt: new Date().toISOString(),
});

// ─── Debt Model ───────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Debt
 * @property {string}       id
 * @property {string}       customerName
 * @property {number}       amount
 * @property {string}       description
 * @property {string|null}  dueDate
 * @property {boolean}      isPaid
 * @property {string|null}  paidAt
 * @property {string}       createdAt
 */

const createDebt = ({ customerName, amount, description = '', dueDate = null }) => ({
  id: uuid(),
  customerName: String(customerName).trim(),
  amount: Number(amount),
  description: String(description).trim(),
  dueDate: dueDate || null,
  isPaid: false,
  paidAt: null,
  createdAt: new Date().toISOString(),
});

// ─── Category Model ───────────────────────────────────────────────────────────

const createCategory = ({ name, color = '#C4643C' }) => ({
  id: uuid(),
  name: String(name).trim(),
  color: String(color).trim(),
  createdAt: new Date().toISOString(),
});

// ─── Customer Model ───────────────────────────────────────────────────────────

const createCustomer = ({ name, phone = '', address = '' }) => ({
  id: uuid(),
  name: String(name).trim(),
  phone: String(phone).trim(),
  address: String(address).trim(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

module.exports = {
  createProduct,
  createTransactionItem,
  createTransaction,
  createDebt,
  createCategory,
  createCustomer,
};
