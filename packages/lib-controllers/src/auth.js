'use strict';

const jwt = require('jsonwebtoken');

// Diambil dari environment variable, fallback ke default yang aman
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'warungku_super_secret_key_2026';

const AuthController = {
    login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username dan kata sandi wajib diisi', data: null });
        }

        if (username === ADMIN_USER && password === ADMIN_PASS) {
            // Buat token JWT berumur 7 hari
            const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

            // Kembalikan token ke client
            return res.status(200).json({
                success: true,
                message: 'Login berhasil',
                data: { token, user: { username } }
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Username atau kata sandi salah',
            data: null
        });
    },

    loginKasir(req, res) {
        // Mode kasir: Langsung beri token JWT dengan role "kasir"
        const token = jwt.sign({ username: 'Kasir', role: 'kasir' }, JWT_SECRET, { expiresIn: '12h' });

        return res.status(200).json({
            success: true,
            message: 'Berhasil masuk Mode Kasir',
            data: { token, user: { username: 'Kasir', role: 'kasir' } }
        });
    },

    me(req, res) {
        // req.user disuntikkan oleh authMiddleware
        return res.status(200).json({
            success: true,
            message: 'Sesi aktif',
            data: { user: req.user }
        });
    }
};

module.exports = { AuthController };
