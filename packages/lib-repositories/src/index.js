// packages/lib-repositories/src/index.js
// @warungku/lib-repositories
// Repository pattern — one object per domain, each wraps @warungku/lib-database.
// No business logic lives here — only data access.

'use strict';

const db = require('@warungku/lib-database');
const { COLLECTIONS: C } = db;
const {
  createProduct, createTransaction, createTransactionItem, createDebt,
  createCategory, createCustomer,
} = require('@warungku/lib-models');

// ─── ProductRepository ────────────────────────────────────────────────────────

const ProductRepository = {
  async findAll({ category, search, sortBy = 'name', order = 'asc' } = {}) {
    return await db.findAll(C.PRODUCTS, {
      filter: (p) => {
        const matchCat = !category || category === 'Semua' || p.category.toLowerCase() === category.toLowerCase();
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      },
      sortBy,
      order,
    });
  },

  async findCategories() {
    const all = await db.read(C.PRODUCTS);
    return [...new Set(all.map((p) => p.category))];
  },

  async findById(id) {
    return await db.findById(C.PRODUCTS, id);
  },

  async create(data) {
    const product = createProduct(data);
    return await db.insert(C.PRODUCTS, product);
  },

  async update(id, partial) {
    return await db.update(C.PRODUCTS, id, partial);
  },

  async remove(id) {
    return await db.remove(C.PRODUCTS, id);
  },
};

// ─── TransactionRepository ────────────────────────────────────────────────────

const TransactionRepository = {
  async findAll({ type, startDate, endDate } = {}) {
    return await db.findAll(C.TRANSACTIONS, {
      filter: (t) => {
        const matchType = !type || t.type === type.toUpperCase();
        const matchStart = !startDate || new Date(t.createdAt) >= new Date(startDate);
        const matchEnd = !endDate || new Date(t.createdAt) <= new Date(endDate);
        return matchType && matchStart && matchEnd;
      },
      sortBy: 'createdAt',
      order: 'desc',
    });
  },

  async findById(id) {
    return await db.findById(C.TRANSACTIONS, id);
  },

  async create({ type, items, total, amountPaid, change, note, discount = 0, paymentMethod = 'CASH' }) {
    const tx = createTransaction({ type, items, total, amountPaid, change, note, discount, paymentMethod });
    return await db.insert(C.TRANSACTIONS, tx);
  },

  async dailySummary() {
    const today = new Date().toDateString();
    const all = await db.read(C.TRANSACTIONS);
    const sales = all.filter(
      (t) => t.type === 'SALE' && new Date(t.createdAt).toDateString() === today
    );
    return {
      transactionCount: sales.length,
      totalRevenue: sales.reduce((s, t) => s + t.total, 0),
      date: today,
    };
  },
};

// ─── DebtRepository ──────────────────────────────────────────────────────────

const DebtRepository = {
  async findAll({ status, search } = {}) {
    return await db.findAll(C.DEBTS, {
      filter: (d) => {
        const matchStatus = !status || status === 'all'
          || (status === 'paid' && d.isPaid)
          || (status === 'unpaid' && !d.isPaid);
        const matchSearch = !search || d.customerName.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
      },
      sortBy: 'createdAt',
      order: 'desc',
    });
  },

  async findById(id) {
    return await db.findById(C.DEBTS, id);
  },

  async create(data) {
    const debt = createDebt(data);
    return await db.insert(C.DEBTS, debt);
  },

  async markAsPaid(id) {
    return await db.update(C.DEBTS, id, { isPaid: true, paidAt: new Date().toISOString() });
  },

  async remove(id) {
    return await db.remove(C.DEBTS, id);
  },

  async stats() {
    const all = await db.read(C.DEBTS);
    const unpaid = all.filter((d) => !d.isPaid);
    return {
      total: all.length,
      unpaidCount: unpaid.length,
      paidCount: all.length - unpaid.length,
      totalUnpaid: unpaid.reduce((s, d) => s + d.amount, 0),
    };
  },

  async dailyStats() {
    const today = new Date().toDateString();
    const all = await db.read(C.DEBTS);
    const todayDebts = all.filter(
      (d) => new Date(d.createdAt).toDateString() === today
    );
    return {
      totalDebt: todayDebts.reduce((s, d) => s + d.amount, 0),
      debtCount: todayDebts.length,
    };
  },
};

// ─── CategoryRepository ───────────────────────────────────────────────────────

const CategoryRepository = {
  async findAll() {
    return await db.findAll(C.CATEGORIES, { sortBy: 'name', order: 'asc' });
  },
  async findById(id) { return await db.findById(C.CATEGORIES, id); },
  async create(data) { const cat = createCategory(data); return await db.insert(C.CATEGORIES, cat); },
  async update(id, p) { return await db.update(C.CATEGORIES, id, p); },
  async remove(id) { return await db.remove(C.CATEGORIES, id); },
};

// ─── CustomerRepository ───────────────────────────────────────────────────────

const CustomerRepository = {
  async findAll({ search } = {}) {
    return await db.findAll(C.CUSTOMERS, {
      filter: (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
      sortBy: 'name',
      order: 'asc',
    });
  },
  async findById(id) { return await db.findById(C.CUSTOMERS, id); },
  async create(data) { const cust = createCustomer(data); return await db.insert(C.CUSTOMERS, cust); },
  async update(id, p) { return await db.update(C.CUSTOMERS, id, { ...p, updatedAt: new Date().toISOString() }); },
  async remove(id) { return await db.remove(C.CUSTOMERS, id); },
};

module.exports = { ProductRepository, TransactionRepository, DebtRepository, CategoryRepository, CustomerRepository };
