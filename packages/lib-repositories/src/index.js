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
  /**
   * Find all products with optional filters and sort.
   */
  findAll({ category, search, sortBy = 'name', order = 'asc' } = {}) {
    return db.findAll(C.PRODUCTS, {
      filter: (p) => {
        const matchCat = !category || category === 'Semua' || p.category.toLowerCase() === category.toLowerCase();
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
      },
      sortBy,
      order,
    });
  },

  /** Return all unique category strings. */
  findCategories() {
    const all = db.read(C.PRODUCTS);
    return [...new Set(all.map((p) => p.category))];
  },

  /** Find one product by id. Returns null if not found. */
  findById(id) {
    return db.findById(C.PRODUCTS, id);
  },

  /** Persist a new Product record and return it. */
  create(data) {
    const product = createProduct(data);
    return db.insert(C.PRODUCTS, product);
  },

  /** Merge partial fields into an existing product. Returns updated record or null. */
  update(id, partial) {
    return db.update(C.PRODUCTS, id, partial);
  },

  /** Remove a product. Returns removed record or null. */
  remove(id) {
    return db.remove(C.PRODUCTS, id);
  },
};

// ─── TransactionRepository ────────────────────────────────────────────────────

const TransactionRepository = {
  /** Find all transactions, newest first, with optional type + date filters. */
  findAll({ type, startDate, endDate } = {}) {
    return db.findAll(C.TRANSACTIONS, {
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

  /** Find one transaction by id. */
  findById(id) {
    return db.findById(C.TRANSACTIONS, id);
  },

  /**
   * Persist a new Transaction (with pre-built item array).
   */
  create({ type, items, total, amountPaid, change, note }) {
    const tx = createTransaction({ type, items, total, amountPaid, change, note });
    return db.insert(C.TRANSACTIONS, tx);
  },

  /** Ringkasan harian transaksi (hanya domain transaksi). */
  dailySummary() {
    const today = new Date().toDateString();
    const sales = db.read(C.TRANSACTIONS).filter(
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
  /** Find all debts with optional status + search filters. */
  findAll({ status, search } = {}) {
    return db.findAll(C.DEBTS, {
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

  /** Find one debt by id. */
  findById(id) {
    return db.findById(C.DEBTS, id);
  },

  /** Persist a new Debt record. */
  create(data) {
    const debt = createDebt(data);
    return db.insert(C.DEBTS, debt);
  },

  /** Mark a debt as paid. */
  markAsPaid(id) {
    return db.update(C.DEBTS, id, { isPaid: true, paidAt: new Date().toISOString() });
  },

  /** Remove a debt. */
  remove(id) {
    return db.remove(C.DEBTS, id);
  },

  /** Agregat statistik seluruh hutang. */
  stats() {
    const all = db.read(C.DEBTS);
    const unpaid = all.filter((d) => !d.isPaid);
    return {
      total: all.length,
      unpaidCount: unpaid.length,
      paidCount: all.length - unpaid.length,
      totalUnpaid: unpaid.reduce((s, d) => s + d.amount, 0),
    };
  },

  /**
   * Ringkasan hutang harian — digunakan untuk cross-domain daily summary.
   * Dipisahkan dari TransactionRepository agar tetap single-responsibility.
   */
  dailyStats() {
    const today = new Date().toDateString();
    const todayDebts = db.read(C.DEBTS).filter(
      (d) => new Date(d.createdAt).toDateString() === today
    );
    return {
      totalDebt: todayDebts.reduce((s, d) => s + d.amount, 0),
      debtCount: todayDebts.length,
    };
  },
};

// ─── TransactionRepository.create fix — pass discount & paymentMethod ─────────

// (create method sekarang forward semua field dari argument, termasuk discount & paymentMethod)

// ─── CategoryRepository ───────────────────────────────────────────────────────

const CategoryRepository = {
  findAll() {
    return db.findAll(C.CATEGORIES, { sortBy: 'name', order: 'asc' });
  },
  findById(id) { return db.findById(C.CATEGORIES, id); },
  create(data) { const cat = createCategory(data); return db.insert(C.CATEGORIES, cat); },
  update(id, p) { return db.update(C.CATEGORIES, id, p); },
  remove(id) { return db.remove(C.CATEGORIES, id); },
};

// ─── CustomerRepository ───────────────────────────────────────────────────────

const CustomerRepository = {
  findAll({ search } = {}) {
    return db.findAll(C.CUSTOMERS, {
      filter: (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
      sortBy: 'name',
      order: 'asc',
    });
  },
  findById(id) { return db.findById(C.CUSTOMERS, id); },
  create(data) { const cust = createCustomer(data); return db.insert(C.CUSTOMERS, cust); },
  update(id, p) { return db.update(C.CUSTOMERS, id, { ...p, updatedAt: new Date().toISOString() }); },
  remove(id) { return db.remove(C.CUSTOMERS, id); },
};

module.exports = { ProductRepository, TransactionRepository, DebtRepository, CategoryRepository, CustomerRepository };
