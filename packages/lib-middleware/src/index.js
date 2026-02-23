// packages/lib-middleware/src/index.js
// @warungku/lib-middleware
// All reusable Express middleware — exported as named functions.

'use strict';

// ─── Request Logger ───────────────────────────────────────────────────────────

/**
 * Logs every request with method, path, status code, and duration.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - start;
    const { statusCode } = res;
    const color = statusCode >= 500 ? '\x1b[31m'
      : statusCode >= 400 ? '\x1b[33m'
        : '\x1b[32m';
    const reset = '\x1b[0m';
    const ts = new Date().toISOString();
    console.log(`${color}[${ts}] ${req.method} ${req.path} ${statusCode} — ${ms}ms${reset}`);
  });

  next();
};

// ─── Error Logger ─────────────────────────────────────────────────────────────

/**
 * Logs unhandled errors before passing them to errorHandler.
 */
const errorLogger = (err, req, res, next) => {
  console.error(`\x1b[31m[ERROR] ${req.method} ${req.path} — ${err.message}\x1b[0m`);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);
  next(err);
};

// ─── Global Error Handler ─────────────────────────────────────────────────────

/**
 * Catches any error thrown in a route and returns a standard JSON error response.
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    data: null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// ─── Not Found Handler ────────────────────────────────────────────────────────

/**
 * Returns 404 for any route that was not matched.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} tidak ditemukan`,
    data: null,
  });
};

// ─── Async Handler ────────────────────────────────────────────────────────────

/**
 * Wraps an async route handler so thrown errors go to errorHandler automatically.
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ─── Validate Body ────────────────────────────────────────────────────────────

/**
 * Express middleware factory — validates req.body with a validate function.
 * The validate fn should return { valid: Boolean, errors: String[] }
 *
 * validateFn dipanggil dengan dua argumen: (body, req)
 * Argumen kedua (req) opsional — berguna untuk mengakses req.params
 * pada PUT route yang memerlukan merge dengan data yang sudah ada.
 *
 * Usage:
 *   const { validate } = require('@warungku/lib-services').ProductService
 *   router.post('/', validateBody(validate), handler)
 *   router.put('/:id', validateBody((body, req) => validate({ ...existing, ...body })), handler)
 */
const validateBody = (validateFn) => (req, res, next) => {
  const { valid, errors } = validateFn(req.body, req);
  if (!valid) {
    return res.status(400).json({
      success: false,
      message: errors.join(', '),
      data: null,
      errors,
    });
  }
  next();
};

// ─── Rate Limiter (simple in-memory) ─────────────────────────────────────────

/**
 * Simple in-memory rate limiter.
 * @param {number} maxRequests  Max requests per window
 * @param {number} windowMs     Time window in ms
 */
const rateLimiter = (maxRequests = 100, windowMs = 60_000) => {
  const store = new Map();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const record = store.get(key) || { count: 0, resetAt: now + windowMs };

    if (now > record.resetAt) {
      record.count = 0;
      record.resetAt = now + windowMs;
    }

    record.count++;
    store.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Terlalu banyak permintaan, coba beberapa saat lagi.',
        data: null,
      });
    }

    next();
  };
};

const { authMiddleware, restrictToAdmin } = require('./auth');

module.exports = {
  requestLogger,
  errorLogger,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateBody,
  rateLimiter,
  authMiddleware,
  restrictToAdmin,
};
