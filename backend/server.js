
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const watchlistRoutes = require('./routes/watchlist');
const watchedRoutes = require('./routes/watched');

const app = express();

app.use((req, res, next) => {
    console.log('REQUEST:', req.method, req.url);
    next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/watched', watchedRoutes);

app.get('/api/movies/test-langsung', (req, res) => {
    res.json({
        message: 'Movies berhasil dari server.js!'
    });
});

app.get('/api/auth/test', (req, res) => {
    res.json({
        message: 'Auth route berhasil terhubung!'
    });
});

// Menjalankan server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
