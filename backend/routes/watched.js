const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

// API untuk melihat riwayat film yang sudah ditonton
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [watched] = await db.execute(
            `SELECT
                reviews.review_id,
                movies.movie_id,
                movies.title,
                movies.year,
                reviews.rating,
                reviews.review,
                reviews.watched_at
            FROM reviews
            JOIN movies ON reviews.movie_id = movies.movie_id
            WHERE reviews.user_id = ?
            ORDER BY reviews.watched_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: watched
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

// API untuk mencatat film yang sudah ditonton
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { movie_id, rating, review } = req.body;

        // Validasi input
        if (!movie_id || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: 'Movie ID, rating, dan review wajib diisi!'
            });
        }

        // Validasi rating
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating harus berupa angka 1 sampai 5!'
            });
        }

        // Memasukkan data review ke database
        await db.execute(
            `INSERT INTO reviews (user_id, movie_id, rating, review)
             VALUES (?, ?, ?, ?)`,
            [userId, movie_id, rating, review]
        );

        res.status(201).json({
            success: true,
            message: 'Film berhasil dicatat sebagai sudah ditonton!'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Film sudah pernah dicatat!'
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({
                success: false,
                message: 'Film tidak ditemukan!'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

module.exports = router;