
const express = require('express');
const db = require('../db');

const router = express.Router();
console.log('MOVIES ROUTES BERHASIL DIMUAT');

// API untuk mengambil semua film
router.get('/', async (req, res) => {
    try {
        // Mengambil data film dari database
        const [movies] = await db.execute(
            'SELECT movie_id AS id, title, genre FROM movies'
        );

        res.json({
            success: true,
            data: movies
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

// API untuk mengambil detail film berdasarkan ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('ID FILM YANG DIMINTA:', id);

        const [movies] = await db.execute(
            'SELECT * FROM movies WHERE movie_id = ?',
            [id]
        );

        if (movies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Film tidak ditemukan!'
            });
        }

        res.json({
            success: true,
            data: movies[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server!'
        });
    }
});

router.get('/test', (req, res) => {
    res.json({
        message: 'Movies route berhasil terhubung!'
    });
});

// API rekomendasi film menggunakan Gemini AI
router.post('/recommend', async (req, res) => {
    try {
        const { mood, description } = req.body;
        const userMood = mood || description;

        // Validasi input
        if (!userMood || typeof userMood !== 'string' || !userMood.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Mood atau deskripsi wajib diisi!'
            });
        }

        // Mengambil daftar film dari database lokal
        const [movies] = await db.execute(
            `SELECT movie_id, title, year, director, genre, synopsis
             FROM movies`
        );

        if (movies.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Belum ada film di database!'
            });
        }

        // Menghubungkan SDK Gemini
        const { GoogleGenAI } = await import('@google/genai');

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        // Membuat prompt berdasarkan data film lokal
        const prompt = `
Kamu adalah asisten rekomendasi film.

Tugasmu adalah memilih SATU film yang paling sesuai
dengan mood atau deskripsi pengguna.

MOOD PENGGUNA:
${userMood}

DAFTAR FILM YANG TERSEDIA DI DATABASE:
${JSON.stringify(movies)}

ATURAN:
1. Pilih hanya film dari daftar database di atas.
2. Jangan membuat judul atau ID film baru.
3. Gunakan movie_id yang persis sama dengan database.
4. Jika tidak ada film yang cocok, tetap pilih film
   yang paling mendekati.
5. Berikan alasan rekomendasi dalam bahasa Indonesia.
6. Jawab hanya dalam format JSON berikut:

{
    "movie_id": 1,
    "reason": "Alasan mengapa film ini cocok."
}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        // Mengubah jawaban Gemini menjadi objek JavaScript
        const recommendation = JSON.parse(response.text);

        // Memastikan ID film benar-benar ada di database
        const selectedMovie = movies.find(
            movie => movie.movie_id === recommendation.movie_id
        );

        if (!selectedMovie || !recommendation.reason) {
            return res.status(502).json({
                success: false,
                message: 'Gemini memberikan rekomendasi yang tidak valid!'
            });
        }

        res.json({
            success: true,
            data: {
                movie_id: selectedMovie.movie_id,
                title: selectedMovie.title,
                reason: recommendation.reason
            }
        });

    } catch (error) {
        console.error('GEMINI ERROR:', error);

        res.status(500).json({
            success: false,
            message: 'Gagal mendapatkan rekomendasi film!'
        });
    }
});

module.exports = router;
