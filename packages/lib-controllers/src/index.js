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

// ─── ProductController ────────────────────────────────────────────────────────

const ProductController = {

  getAll(req, res) {
    const { category, search, sortBy, order } = req.query;
    const products = ProductService.getAll({ category, search, sortBy, order });
    const categories = ProductService.getCategories();
    return success(res, { products, categories, total: products.length });
  },

  getOne(req, res) {
    const product = ProductService.getById(req.params.id);
    if (!product) return notFound(res, 'Produk tidak ditemukan');
    return success(res, product);
  },

  create(req, res) {
    const product = ProductService.create(req.body);
    return created(res, product, 'Produk berhasil ditambahkan');
  },

  update(req, res) {
    const exists = ProductService.getById(req.params.id);
    if (!exists) return notFound(res, 'Produk tidak ditemukan');
    const updated = ProductService.update(req.params.id, req.body);
    return success(res, updated, 'Produk berhasil diperbarui');
  },

  remove(req, res) {
    const exists = ProductService.getById(req.params.id);
    if (!exists) return notFound(res, 'Produk tidak ditemukan');
    ProductService.remove(req.params.id);
    return success(res, null, 'Produk berhasil dihapus');
  },
};

// ─── TransactionController ────────────────────────────────────────────────────

const TransactionController = {

  getAll(req, res) {
    const { type, startDate, endDate } = req.query;
    const transactions = TransactionService.getAll({ type, startDate, endDate });
    const totalRevenue = transactions
      .filter((t) => t.type === 'SALE')
      .reduce((s, t) => s + t.total, 0);
    return success(res, { transactions, totalRevenue, count: transactions.length });
  },

  dailySummary(req, res) {
    // Gabungkan ringkasan transaksi + hutang harian di layer controller
    // (masing-masing service hanya bertanggung jawab pada domain-nya sendiri)
    const txSummary = TransactionService.dailySummary();
    const debtSummary = DebtService.dailyStats();
    return success(res, { ...txSummary, ...debtSummary });
  },

  create(req, res) {
    const { items, amountPaid, note, discount = 0, paymentMethod = 'CASH' } = req.body;
    const result = TransactionService.processCheckout({ items, amountPaid, note, discount, paymentMethod });
    if (!result.valid) return badReq(res, result.errors.join(', '));
    return created(res, result.data, 'Transaksi berhasil');
  },
};

// ─── DebtController ───────────────────────────────────────────────────────────

const DebtController = {

  getAll(req, res) {
    const { status, search } = req.query;
    const debts = DebtService.getAll({ status, search });
    const stats = DebtService.stats();
    return success(res, { debts, stats });
  },

  create(req, res) {
    const debt = DebtService.create(req.body);
    return created(res, debt, 'Hutang berhasil dicatat');
  },

  pay(req, res) {
    const result = DebtService.processPay(req.params.id);
    if (!result.valid) {
      const code = result.errors[0] === 'Data hutang tidak ditemukan' ? 404 : 400;
      return send(res, code, false, result.errors.join(', '), null);
    }
    return success(res, result.data, 'Hutang berhasil dilunasi');
  },

  remove(req, res) {
    const exists = DebtService.getById(req.params.id);
    if (!exists) return notFound(res, 'Data hutang tidak ditemukan');
    DebtService.remove(req.params.id);
    return success(res, null, 'Data hutang berhasil dihapus');
  },
};

// ─── CategoryController ─────────────────────────────────────────────

const CategoryController = {
  getAll(req, res) { return success(res, CategoryService.getAll()); },
  getOne(req, res) {
    const cat = CategoryService.getById(req.params.id);
    if (!cat) return notFound(res, 'Kategori tidak ditemukan');
    return success(res, cat);
  },
  create(req, res) {
    const v = CategoryService.validate(req.body);
    if (!v.valid) return badReq(res, v.errors.join(', '));
    return created(res, CategoryService.create(req.body), 'Kategori ditambahkan');
  },
  update(req, res) {
    const cat = CategoryService.getById(req.params.id);
    if (!cat) return notFound(res, 'Kategori tidak ditemukan');
    return success(res, CategoryService.update(req.params.id, req.body), 'Kategori diperbarui');
  },
  remove(req, res) {
    if (!CategoryService.getById(req.params.id)) return notFound(res, 'Kategori tidak ditemukan');
    CategoryService.remove(req.params.id);
    return success(res, null, 'Kategori dihapus');
  },
};

// ─── CustomerController ─────────────────────────────────────────────

const CustomerController = {
  getAll(req, res) { return success(res, CustomerService.getAll(req.query)); },
  getOne(req, res) {
    const c = CustomerService.getById(req.params.id);
    if (!c) return notFound(res, 'Pelanggan tidak ditemukan');
    return success(res, c);
  },
  create(req, res) {
    const v = CustomerService.validate(req.body);
    if (!v.valid) return badReq(res, v.errors.join(', '));
    return created(res, CustomerService.create(req.body), 'Pelanggan ditambahkan');
  },
  update(req, res) {
    const c = CustomerService.getById(req.params.id);
    if (!c) return notFound(res, 'Pelanggan tidak ditemukan');
    return success(res, CustomerService.update(req.params.id, req.body), 'Pelanggan diperbarui');
  },
  remove(req, res) {
    if (!CustomerService.getById(req.params.id)) return notFound(res, 'Pelanggan tidak ditemukan');
    CustomerService.remove(req.params.id);
    return success(res, null, 'Pelanggan dihapus');
  },
};

const { AuthController } = require('./auth');

module.exports = {
  ProductController, TransactionController, DebtController,
  CategoryController, CustomerController, AuthController
};
