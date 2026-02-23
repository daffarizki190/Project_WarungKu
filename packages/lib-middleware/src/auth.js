'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'warungku_super_secret_key_2026';

/**
 * Middleware untuk memvalidasi Bearer Token JWT pada Header / Cookies.
 * Jika valid, user dipersilakan lewat. Jika tidak, return 401 Unauthorized.
 */
const authMiddleware = (req, res, next) => {
    // Pengecualian untuk jalur login
    if (req.path.startsWith('/api/auth/login')) {
        return next();
    }

    // Pengecualian rute non-API, spt static assets jika ada
    if (!req.path.startsWith('/api/')) {
        return next();
    }

    let token = null;

    // 1. Coba baca dari Authorization Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fallback baca dari cookies (berguna jika kita mau pure httpOnly cookie session)
    else if (req.cookies && req.cookies.wk_session) {
        token = req.cookies.wk_session;
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Sesi anda telah berakhir atau anda belum login.',
            data: null
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // simpan data user (username, role) ke request
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Sesi tidak valid atau telah kadaluwarsa.',
            data: null
        });
    }
};

/**
 * Middleware untuk mengecek apakah user yang login memiliki role admin.
 * Kasir akan ditolak aksesnya (403 Forbidden). Harus dipanggil *setelah* authMiddleware.
 */
const restrictToAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Akses Ditolak: Fitur ini hanya untuk Admin.',
        data: null
    });
};

module.exports = {
    authMiddleware,
    restrictToAdmin,
    JWT_SECRET
};
