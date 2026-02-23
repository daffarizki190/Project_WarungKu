// packages/lib-services/src/index.js
// @warungku/lib-services
// Business logic layer — validation, domain rules, atomic operations.
// Controllers call services; services call repositories.

'use strict';

const db = require('@warungku/lib-database');
const { COLLECTIONS: C } = db;
const { ProductRepository, TransactionRepository, DebtRepository, CategoryRepository, CustomerRepository } = require('@warungku/lib-repositories');
const { createTransactionItem } = require('@warungku/lib-models');

// ─── Helper: build validation result ─────────────────────────────────────────
const ok = (data) => ({ valid: true, errors: [], data });
const fail = (...errors) => ({ valid: false, errors, data: null });

// ─── ProductService ───────────────────────────────────────────────────────────

const ProductService = {

  /** Validate product payload. Returns { valid, errors }. */
  validate({ name, category, price, stock }) {
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('Nama produk minimal 2 karakter');
    if (!category || String(category).trim().length < 1) errors.push('Kategori wajib diisi');
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) errors.push('Harga harus angka positif');
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) errors.push('Stok harus angka positif');
    return errors.length ? fail(...errors) : ok(null);
  },

  getAll(query) { return ProductRepository.findAll(query); },
  getCategories() { return ProductRepository.findCategories(); },
  getById(id) { return ProductRepository.findById(id); },
  create(data) { return ProductRepository.create(data); },
  update(id, partial) { return ProductRepository.update(id, partial); },
  remove(id) { return ProductRepository.remove(id); },
};

// ─── TransactionService ───────────────────────────────────────────────────────

const TransactionService = {

  /** Validate transaction payload. */
  validate({ items, amountPaid }) {
    const errors = [];
    if (!Array.isArray(items) || items.length === 0) errors.push('Items tidak boleh kosong');
    if (amountPaid === undefined || isNaN(Number(amountPaid))) errors.push('Jumlah bayar tidak valid');
    return errors.length ? fail(...errors) : ok(null);
  },

  getAll(query) { return TransactionRepository.findAll(query); },
  dailySummary() { return TransactionRepository.dailySummary(); },

  /**
   * Core business rule: validate stock, deduct, record transaction atomically.
   * Mendukung diskon (nominal) dan metode pembayaran.
   */
  processCheckout({ items, amountPaid, note = '', discount = 0, paymentMethod = 'CASH' }) {
    const discountAmount = Math.max(0, Number(discount));
    // 1. Collect products (avoid N+1 by reading all products once)
    const allProducts = db.read(C.PRODUCTS);
    const productMap = new Map(allProducts.map((p) => [p.id, p]));

    // 2. Validate each item
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return fail(`Produk tidak ditemukan: ${item.productId}`);
      }
      if (product.stock < item.qty) {
        return fail(`Stok "${product.name}" tidak cukup (sisa: ${product.stock})`);
      }
    }

    // 3. Hitung total sebelum dan sesudah diskon
    const lineItems = items.map((item) => {
      const product = productMap.get(item.productId);
      return createTransactionItem({ productId: item.productId, name: product.name, price: product.price, qty: item.qty });
    });

    const subtotal = lineItems.reduce((s, i) => s + i.subtotal, 0);
    const total = Math.max(0, subtotal - discountAmount);
    const change = Number(amountPaid) - total;

    if (change < 0) return fail('Uang yang dibayarkan kurang');

    // 4. Atomic: deduct stock + create transaction
    const transaction = db.atomic(({ write, read }) => {
      const products = read(C.PRODUCTS);
      items.forEach((item) => {
        const idx = products.findIndex((p) => p.id === item.productId);
        if (idx !== -1) products[idx].stock -= item.qty;
      });
      write(C.PRODUCTS, products);

      return TransactionRepository.create({
        type: 'SALE', items: lineItems, total, amountPaid: Number(amountPaid),
        change, note, discount: discountAmount, paymentMethod,
      });
    });

    return ok(transaction);
  },
};

// ─── DebtService ──────────────────────────────────────────────────────────────

const DebtService = {

  /** Validate debt payload. */
  validate({ customerName, amount }) {
    const errors = [];
    if (!customerName || String(customerName).trim().length < 2) errors.push('Nama pelanggan minimal 2 karakter');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errors.push('Jumlah hutang harus lebih dari 0');
    return errors.length ? fail(...errors) : ok(null);
  },

  getAll(query) { return DebtRepository.findAll(query); },
  stats() { return DebtRepository.stats(); },
  dailyStats() { return DebtRepository.dailyStats(); },
  getById(id) { return DebtRepository.findById(id); },
  create(data) { return DebtRepository.create(data); },
  remove(id) { return DebtRepository.remove(id); },

  /**
   * Core business rule: mark paid + record repayment transaction atomically.
   */
  processPay(id) {
    const debt = DebtRepository.findById(id);
    if (!debt) return fail('Data hutang tidak ditemukan');
    if (debt.isPaid) return fail('Hutang sudah lunas');

    const result = db.atomic(() => {
      const updated = DebtRepository.markAsPaid(id);
      TransactionRepository.create({
        type: 'DEBT_PAYMENT',
        items: [createTransactionItem({ productId: null, name: `Pelunasan hutang — ${debt.customerName}`, price: debt.amount, qty: 1 })],
        total: debt.amount,
        amountPaid: debt.amount,
        change: 0,
        note: `Pelunasan hutang ${debt.customerName}`,
      });
      return updated;
    });

    return ok(result);
  },
};

// ─── CategoryService ──────────────────────────────────────────────

const CategoryService = {
  validate({ name }) {
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('Nama kategori minimal 2 karakter');
    return errors.length ? fail(...errors) : ok(null);
  },
  getAll() { return CategoryRepository.findAll(); },
  getById(id) { return CategoryRepository.findById(id); },
  create(data) { return CategoryRepository.create(data); },
  update(id, data) { return CategoryRepository.update(id, data); },
  remove(id) { return CategoryRepository.remove(id); },
};

// ─── CustomerService ─────────────────────────────────────────────

const CustomerService = {
  validate({ name }) {
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('Nama pelanggan minimal 2 karakter');
    return errors.length ? fail(...errors) : ok(null);
  },
  getAll(q) { return CustomerRepository.findAll(q); },
  getById(id) { return CustomerRepository.findById(id); },
  create(data) { return CustomerRepository.create(data); },
  update(id, data) { return CustomerRepository.update(id, data); },
  remove(id) { return CustomerRepository.remove(id); },
};

module.exports = { ProductService, TransactionService, DebtService, CategoryService, CustomerService };
