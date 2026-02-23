// packages/lib-services/src/index.js
// @warungku/lib-services
// Business logic layer — validation, domain rules, atomic operations.
// Controllers call services; services call repositories.

'use strict';

const db = require('@warungku/lib-database');
const { COLLECTIONS: C } = db;
const { ProductRepository, TransactionRepository, DebtRepository, CategoryRepository, CustomerRepository } = require('@warungku/lib-repositories');
const { createTransactionItem } = require('@warungku/lib-models');

const ok = (data) => ({ valid: true, errors: [], data });
const fail = (...errors) => ({ valid: false, errors, data: null });

const ProductService = {
  validate({ name, category, price, stock }) {
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('Nama produk minimal 2 karakter');
    if (!category || String(category).trim().length < 1) errors.push('Kategori wajib diisi');
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) errors.push('Harga harus angka positif');
    if (stock === undefined || isNaN(Number(stock)) || Number(stock) < 0) errors.push('Stok harus angka positif');
    return errors.length ? fail(...errors) : ok(null);
  },

  async getAll(query) { return await ProductRepository.findAll(query); },
  async getCategories() { return await ProductRepository.findCategories(); },
  async getById(id) { return await ProductRepository.findById(id); },
  async create(data) { return await ProductRepository.create(data); },
  async update(id, partial) { return await ProductRepository.update(id, partial); },
  async remove(id) { return await ProductRepository.remove(id); },
};

const TransactionService = {
  validate({ items, amountPaid }) {
    const errors = [];
    if (!Array.isArray(items) || items.length === 0) errors.push('Items tidak boleh kosong');
    if (amountPaid === undefined || isNaN(Number(amountPaid))) errors.push('Jumlah bayar tidak valid');
    return errors.length ? fail(...errors) : ok(null);
  },

  async getAll(query) { return await TransactionRepository.findAll(query); },
  async dailySummary() { return await TransactionRepository.dailySummary(); },

  async processCheckout({ items, amountPaid, note = '', discount = 0, paymentMethod = 'CASH' }) {
    const discountAmount = Math.max(0, Number(discount));

    // 1. Collect and validate products
    let lineItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await ProductRepository.findById(item.productId);
      if (!product) return fail(`Produk tidak ditemukan: ${item.productId}`);
      if (product.stock < item.qty) return fail(`Stok "${product.name}" tidak cukup (sisa: ${product.stock})`);

      const lItem = createTransactionItem({ productId: item.productId, name: product.name, price: product.price, qty: item.qty });
      lineItems.push(lItem);
      subtotal += lItem.subtotal;
    }

    const total = Math.max(0, subtotal - discountAmount);
    const change = Number(amountPaid) - total;

    if (change < 0) return fail('Uang yang dibayarkan kurang');

    // 4. Atomic: deduct stock + create transaction
    const transaction = await db.atomic(async () => {
      for (const item of items) {
        const p = await ProductRepository.findById(item.productId);
        if (p) await ProductRepository.update(p.id, { stock: p.stock - item.qty });
      }

      return await TransactionRepository.create({
        type: 'SALE', items: lineItems, total, amountPaid: Number(amountPaid),
        change, note, discount: discountAmount, paymentMethod,
      });
    });

    return ok(transaction);
  },
};

const DebtService = {
  validate({ customerName, amount }) {
    const errors = [];
    if (!customerName || String(customerName).trim().length < 2) errors.push('Nama pelanggan minimal 2 karakter');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) errors.push('Jumlah hutang harus lebih dari 0');
    return errors.length ? fail(...errors) : ok(null);
  },

  async getAll(query) { return await DebtRepository.findAll(query); },
  async stats() { return await DebtRepository.stats(); },
  async dailyStats() { return await DebtRepository.dailyStats(); },
  async getById(id) { return await DebtRepository.findById(id); },
  async create(data) { return await DebtRepository.create(data); },
  async remove(id) { return await DebtRepository.remove(id); },

  async processPay(id) {
    const debt = await DebtRepository.findById(id);
    if (!debt) return fail('Data hutang tidak ditemukan');
    if (debt.isPaid) return fail('Hutang sudah lunas');

    const result = await db.atomic(async () => {
      const updated = await DebtRepository.markAsPaid(id);
      await TransactionRepository.create({
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

const CategoryService = {
  validate({ name }) {
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('Nama kategori minimal 2 karakter');
    return errors.length ? fail(...errors) : ok(null);
  },
  async getAll() { return await CategoryRepository.findAll(); },
  async getById(id) { return await CategoryRepository.findById(id); },
  async create(data) { return await CategoryRepository.create(data); },
  async update(id, data) { return await CategoryRepository.update(id, data); },
  async remove(id) { return await CategoryRepository.remove(id); },
};

const CustomerService = {
  validate({ name }) {
    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push('Nama pelanggan minimal 2 karakter');
    return errors.length ? fail(...errors) : ok(null);
  },
  async getAll(q) { return await CustomerRepository.findAll(q); },
  async getById(id) { return await CustomerRepository.findById(id); },
  async create(data) { return await CustomerRepository.create(data); },
  async update(id, data) { return await CustomerRepository.update(id, data); },
  async remove(id) { return await CustomerRepository.remove(id); },
};

module.exports = { ProductService, TransactionService, DebtService, CategoryService, CustomerService };
