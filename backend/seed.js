
const fs = require('fs');
const path = require('path');
const db = require('./db');

// Membaca file movies.json
const moviesPath = path.join(__dirname, '../data/movies.json');
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf8'));

async function seedMovies() {
    try {
        // Memasukkan data film ke database
        for (const movie of movies) {
            await db.execute(
                `INSERT INTO movies
                (movie_id, title, year, director, genre, rating,
                duration, synopsis, poster_url, \`cast\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    movie.id,
                    movie.title,
                    movie.year,
                    movie.director,
                    JSON.stringify(movie.genres),
                    movie.rating,
                    movie.duration,
                    movie.synopsis,
                    movie.poster_url,
                    JSON.stringify(movie.cast)
                ]
            );
        }

        console.log('Berhasil memasukkan data film!');
    } catch (error) {
        console.error('Terjadi kesalahan:', error.message);
    } finally {
        await db.end();
    }
}

seedMovies();
