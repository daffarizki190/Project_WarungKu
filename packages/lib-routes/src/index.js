// packages/lib-routes/src/index.js
// @warungku/lib-routes

'use strict';

const { Router } = require('express');
const {
  ProductController, TransactionController, DebtController,
  CustomerController,
} = require('@warungku/lib-controllers');
const {
  ProductService, TransactionService, DebtService,
  CustomerService,
} = require('@warungku/lib-services');
const { asyncHandler, validateBody, restrictToAdmin } = require('@warungku/lib-middleware');

// ─── Auth Router ──────────────────────────────────────────────────────────────

const authRouter = Router();
const { AuthController } = require('@warungku/lib-controllers');

authRouter
  .post('/login', asyncHandler(AuthController.login))
  .post('/login-kasir', asyncHandler(AuthController.loginKasir))
  .get('/me', asyncHandler(AuthController.me));

// ─── Product Router ───────────────────────────────────────────────────────────

const productRouter = Router();

productRouter
  .get('/', asyncHandler(ProductController.getAll))
  .get('/:id', asyncHandler(ProductController.getOne))
  .post('/', restrictToAdmin, validateBody(ProductService.validate), asyncHandler(ProductController.create))
  .put('/:id', restrictToAdmin, validateBody((b, req) => {
    const existing = ProductService.getById(req?.params?.id) || {};
    return ProductService.validate({ ...existing, ...b });
  }), asyncHandler(ProductController.update))
  .delete('/:id', restrictToAdmin, asyncHandler(ProductController.remove));

// ─── Transaction Router ───────────────────────────────────────────────────────

const transactionRouter = Router();

transactionRouter
  .get('/summary/daily', asyncHandler(TransactionController.dailySummary))
  .get('/', asyncHandler(TransactionController.getAll))
  .post('/', validateBody(TransactionService.validate), asyncHandler(TransactionController.create));

// ─── Debt Router ──────────────────────────────────────────────────────────────

const debtRouter = Router();

debtRouter
  .get('/', asyncHandler(DebtController.getAll))
  .post('/', validateBody(DebtService.validate), asyncHandler(DebtController.create)) // Kasir boleh catat hutang baru
  .patch('/:id/pay', asyncHandler(DebtController.pay)) // Kasir boleh melunasi hutang
  .delete('/:id', restrictToAdmin, asyncHandler(DebtController.remove));


// ─── Customer Router ──────────────────────────────────────────────────────────

const customerRouter = Router();

customerRouter
  .get('/', asyncHandler(CustomerController.getAll))
  .get('/:id', asyncHandler(CustomerController.getOne))
  .post('/', validateBody(CustomerService.validate), asyncHandler(CustomerController.create)) // Kasir boleh tambah pelanggan
  .put('/:id', restrictToAdmin, asyncHandler(CustomerController.update))
  .delete('/:id', restrictToAdmin, asyncHandler(CustomerController.remove));

// ─── Mount helper ─────────────────────────────────────────────────────────────

const mountRoutes = (app) => {
  app.use('/api/auth', authRouter);
  app.use('/api/products', productRouter);
  app.use('/api/transactions', transactionRouter);
  app.use('/api/debts', debtRouter);
  app.use('/api/customers', customerRouter);
};

module.exports = {
  productRouter, transactionRouter, debtRouter,
  customerRouter, authRouter,
  mountRoutes,
};
