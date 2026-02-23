// server/src/server.js
// @warungku/server
// Express bootstrap — security, parsers, mounts all library layers.
// Contains zero business logic; all logic lives in library packages.

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const { requestLogger, errorLogger, errorHandler, notFoundHandler, rateLimiter, authMiddleware } = require('@warungku/lib-middleware');
const { mountRoutes } = require('@warungku/lib-routes');

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security middleware ──────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(rateLimiter(300, 15 * 60 * 1000));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ─── Parsers ──────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'wk_secret'));

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(requestLogger);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({
  status: 'OK',
  uptime: process.uptime(),
  env: process.env.NODE_ENV || 'development',
  time: new Date().toISOString(),
}));

// ─── Authentication Bouncer ─────────────────────────────────────────────────────
// Seluruh Endpoint /api akan dilindungi otentikasi JWT (kecuali /api/auth/login)
app.use(authMiddleware);

// ─── Mount all API routes from @warungku/lib-routes ──────────────────────────
mountRoutes(app);

// ─── Backup & Restore endpoints ───────────────────────────────────────────────
const db = require('@warungku/lib-database');
const { COLLECTIONS: C } = db;

app.get('/api/backup', async (req, res) => {
  const backup = {};
  for (const [, col] of Object.entries(C)) {
    backup[col] = await db.read(col);
  }
  const json = JSON.stringify(backup, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Disposition', `attachment; filename="warungku-backup-${date}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(json);
});

app.post('/api/restore', express.json({ limit: '50mb' }), async (req, res) => {
  const backup = req.body;
  if (typeof backup !== 'object' || Array.isArray(backup)) {
    return res.status(400).json({ success: false, message: 'Format backup tidak valid' });
  }
  for (const [, col] of Object.entries(C)) {
    if (Array.isArray(backup[col])) {
      await db.write(col, backup[col]);
    }
  }
  return res.json({ success: true, message: 'Data berhasil direstore' });
});

// ─── Serve React Frontend (Produksi) ──────────────────────────────────────────
const clientBuildPath = path.join(__dirname, '../../client/build');
app.use(express.static(clientBuildPath));

// Hindari menangkap rute API yang tidak valid ke index.html (biarkan 404 handler)
app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// ─── Error + 404 handling (must be last) ─────────────────────────────────────
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
let server;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.log(`\x1b[32m🏪  WarungKu → http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[36m📦  ENV: ${process.env.NODE_ENV || 'development'}\x1b[0m`);
  });
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n\x1b[33m${signal} — shutting down...\x1b[0m`);
  if (server) {
    server.close(() => {
      console.log('\x1b[32mServer closed.\x1b[0m');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
