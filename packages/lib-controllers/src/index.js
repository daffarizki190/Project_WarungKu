// packages/lib-controllers/src/index.js
// @warungku/lib-controllers
// HTTP layer — reads req, calls service, sends standardized JSON response.
// Controllers never contain business logic; they only orchestrate req → service → res.

'use strict';

const { ProductService, TransactionService, DebtService, CategoryService, CustomerService } = require('@warungku/lib-services');

// ─── Response helpers (local to this module) ──────────────────────────────────
const send = (res, statusCode, success, message, data) =>
  res.status(statusCode).json({ success, message, data });

const success = (res, data, message = 'OK', code = 200) => send(res, code, true, message, data);
const created = (res, data, message = 'Created') => send(res, 201, true, message, data);
const badReq = (res, message) => send(res, 400, false, message, null);
const notFound = (res, message = 'Tidak ditemukan') => send(res, 404, false, message, null);
const serverError = (res, err) => {
  console.error('Controller Error:', err);
  send(res, 500, false, 'Terjadi kesalahan sistem internal', null);
};

// Async wrapper helper
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => serverError(res, err));
};

// ─── ProductController ────────────────────────────────────────────────────────

const ProductController = {
  getAll: catchAsync(async (req, res) => {
    const { category, search, sortBy, order } = req.query;
    const products = await ProductService.getAll({ category, search, sortBy, order });
    const categories = await ProductService.getCategories();
    return success(res, { products, categories, total: products.length });
  }),

  getOne: catchAsync(async (req, res) => {
    const product = await ProductService.getById(req.params.id);
    if (!product) return notFound(res, 'Produk tidak ditemukan');
    return success(res, product);
  }),

  create: catchAsync(async (req, res) => {
    const product = await ProductService.create(req.body);
    return created(res, product, 'Produk berhasil ditambahkan');
  }),

  update: catchAsync(async (req, res) => {
    const exists = await ProductService.getById(req.params.id);
    if (!exists) return notFound(res, 'Produk tidak ditemukan');
    const updated = await ProductService.update(req.params.id, req.body);
    return success(res, updated, 'Produk berhasil diperbarui');
  }),

  remove: catchAsync(async (req, res) => {
    const exists = await ProductService.getById(req.params.id);
    if (!exists) return notFound(res, 'Produk tidak ditemukan');
    await ProductService.remove(req.params.id);
    return success(res, null, 'Produk berhasil dihapus');
  }),
};

// ─── TransactionController ────────────────────────────────────────────────────

const TransactionController = {
  getAll: catchAsync(async (req, res) => {
    const { type, startDate, endDate } = req.query;
    const transactions = await TransactionService.getAll({ type, startDate, endDate });
    const totalRevenue = transactions
      .filter((t) => t.type === 'SALE')
      .reduce((s, t) => s + t.total, 0);
    return success(res, { transactions, totalRevenue, count: transactions.length });
  }),

  dailySummary: catchAsync(async (req, res) => {
    const txSummary = await TransactionService.dailySummary();
    const debtSummary = await DebtService.dailyStats();
    return success(res, { ...txSummary, ...debtSummary });
  }),

  create: catchAsync(async (req, res) => {
    const { items, amountPaid, note, discount = 0, paymentMethod = 'CASH' } = req.body;
    const result = await TransactionService.processCheckout({ items, amountPaid, note, discount, paymentMethod });
    if (!result.valid) return badReq(res, result.errors.join(', '));
    return created(res, result.data, 'Transaksi berhasil');
  }),
};

// ─── DebtController ───────────────────────────────────────────────────────────

const DebtController = {
  getAll: catchAsync(async (req, res) => {
    const { status, search } = req.query;
    const debts = await DebtService.getAll({ status, search });
    const stats = await DebtService.stats();
    return success(res, { debts, stats });
  }),

  create: catchAsync(async (req, res) => {
    const debt = await DebtService.create(req.body);
    return created(res, debt, 'Hutang berhasil dicatat');
  }),

  pay: catchAsync(async (req, res) => {
    const result = await DebtService.processPay(req.params.id);
    if (!result.valid) {
      const code = result.errors[0] === 'Data hutang tidak ditemukan' ? 404 : 400;
      return send(res, code, false, result.errors.join(', '), null);
    }
    return success(res, result.data, 'Hutang berhasil dilunasi');
  }),

  remove: catchAsync(async (req, res) => {
    const exists = await DebtService.getById(req.params.id);
    if (!exists) return notFound(res, 'Data hutang tidak ditemukan');
    await DebtService.remove(req.params.id);
    return success(res, null, 'Data hutang berhasil dihapus');
  }),
};

// ─── CategoryController ─────────────────────────────────────────────

const CategoryController = {
  getAll: catchAsync(async (req, res) => { return success(res, await CategoryService.getAll()); }),
  getOne: catchAsync(async (req, res) => {
    const cat = await CategoryService.getById(req.params.id);
    if (!cat) return notFound(res, 'Kategori tidak ditemukan');
    return success(res, cat);
  }),
  create: catchAsync(async (req, res) => {
    const v = CategoryService.validate(req.body);
    if (!v.valid) return badReq(res, v.errors.join(', '));
    return created(res, await CategoryService.create(req.body), 'Kategori ditambahkan');
  }),
  update: catchAsync(async (req, res) => {
    const cat = await CategoryService.getById(req.params.id);
    if (!cat) return notFound(res, 'Kategori tidak ditemukan');
    return success(res, await CategoryService.update(req.params.id, req.body), 'Kategori diperbarui');
  }),
  remove: catchAsync(async (req, res) => {
    if (!(await CategoryService.getById(req.params.id))) return notFound(res, 'Kategori tidak ditemukan');
    await CategoryService.remove(req.params.id);
    return success(res, null, 'Kategori dihapus');
  }),
};

// ─── CustomerController ─────────────────────────────────────────────

const CustomerController = {
  getAll: catchAsync(async (req, res) => { return success(res, await CustomerService.getAll(req.query)); }),
  getOne: catchAsync(async (req, res) => {
    const c = await CustomerService.getById(req.params.id);
    if (!c) return notFound(res, 'Pelanggan tidak ditemukan');
    return success(res, c);
  }),
  create: catchAsync(async (req, res) => {
    const v = CustomerService.validate(req.body);
    if (!v.valid) return badReq(res, v.errors.join(', '));
    return created(res, await CustomerService.create(req.body), 'Pelanggan ditambahkan');
  }),
  update: catchAsync(async (req, res) => {
    const c = await CustomerService.getById(req.params.id);
    if (!c) return notFound(res, 'Pelanggan tidak ditemukan');
    return success(res, await CustomerService.update(req.params.id, req.body), 'Pelanggan diperbarui');
  }),
  remove: catchAsync(async (req, res) => {
    if (!(await CustomerService.getById(req.params.id))) return notFound(res, 'Pelanggan tidak ditemukan');
    await CustomerService.remove(req.params.id);
    return success(res, null, 'Pelanggan dihapus');
  }),
};

const { AuthController } = require('./auth');

module.exports = {
  ProductController, TransactionController, DebtController,
  CategoryController, CustomerController, AuthController
};
