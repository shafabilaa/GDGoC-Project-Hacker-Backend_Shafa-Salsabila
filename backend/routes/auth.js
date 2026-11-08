
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
console.log('AUTH ROUTES BERHASIL DIMUAT');

// API Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validasi input
        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Username, email, dan password wajib diisi!'
            });
        }

        // Cek apakah email sudah terdaftar
        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: 'Email sudah terdaftar!'
            });
        }

        // Mengubah password menjadi hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Menyimpan user ke database
        await db.execute(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: 'Registrasi berhasil!'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

console.log('ROUTE LOGIN TERDAFTAR');
// API Login
router.post('/login', async (req, res) => {
    try { 
        console.log('REQUEST LOGIN MASUK');

        const { email, password } = req.body;

        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email dan password wajib diisi!'
            });
        }

        // Mencari user berdasarkan email
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: 'Email atau password salah!'
            });
        }

        const user = users[0];

        // Memeriksa password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Email atau password salah!'
            });
        }

        // Membuat JWT
        const token = jwt.sign(
            {
                user_id: user.user_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.json({
            message: 'Login berhasil!',
            token: token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

router.get('/cek-login', (req, res) => {
    res.json({
        message: 'Route login berhasil terdeteksi!'
    });
});

module.exports = router;