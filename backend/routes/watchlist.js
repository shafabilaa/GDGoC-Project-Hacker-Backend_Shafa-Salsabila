const express = require('express');
const db = require('../db');
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();
// API untuk melihat watchlist user
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [watchlist] = await db.execute(
            `SELECT 
                watchlist.wlist_id,
                movies.movie_id,
                movies.title,
                movies.year,
                movies.genre,
                watchlist.added_at
            FROM watchlist
            JOIN movies ON watchlist.movie_id = movies.movie_id
            WHERE watchlist.user_id = ?`,
            [userId]
        );

        res.json({
            success: true,
            data: watchlist
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

// API untuk menambahkan film ke watchlist
router.post('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { movie_id } = req.body;

        if (!movie_id) {
            return res.status(400).json({
                success: false,
                message: 'Movie ID wajib diisi!'
            });
        }

        await db.execute(
            'INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)',
            [userId, movie_id]
        );

        res.status(201).json({
            success: true,
            message: 'Film berhasil ditambahkan ke watchlist!'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Film sudah ada di watchlist!'
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

// API untuk menghapus film dari watchlist
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { id } = req.params;

        const [result] = await db.execute(
            'DELETE FROM watchlist WHERE wlist_id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Film tidak ditemukan di watchlist!'
            });
        }

        res.json({
            success: true,
            message: 'Film berhasil dihapus dari watchlist!'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

module.exports = router;