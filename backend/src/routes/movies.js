const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/movies - List all movies
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT movie_id, title, release_date, avg_rating FROM Movie ORDER BY title'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/movies/:id - Get movie details with cast, crew, genres, ratings
router.get('/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    // Get movie
    const [[movie]] = await pool.query(
      'SELECT * FROM Movie WHERE movie_id = ?',
      [movieId]
    );
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Get genres
    const [genres] = await pool.query(
      `SELECT g.genre_id, g.name 
       FROM Genre g 
       JOIN Movie_Genre mg ON g.genre_id = mg.genre_id 
       WHERE mg.movie_id = ?`,
      [movieId]
    );

    // Get cast & crew
    const [people] = await pool.query(
      `SELECT p.person_id, p.name, p.date_of_birth, p.gender, mpr.role
       FROM Person p
       JOIN Movie_Person_Relationships mpr ON p.person_id = mpr.person_id
       WHERE mpr.movie_id = ?`,
      [movieId]
    );

    // Get ratings
    const [ratings] = await pool.query(
      `SELECT r.rating_id, r.user_id, u.username, r.numeric_rating, r.verbal_rating, r.rating_date
       FROM Rating r
       LEFT JOIN UserTable u ON r.user_id = u.user_id
       WHERE r.movie_id = ?
       ORDER BY r.rating_date DESC`,
      [movieId]
    );

    res.json({ movie, genres, people, ratings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/movies/profit/:movieName - Get movie profit using stored procedure
router.get('/profit/:movieName', async (req, res) => {
  const { movieName } = req.params;
  try {
    const [rows] = await pool.query('CALL GetMovieProfit(?)', [movieName]);
    // MySQL CALL returns results in nested array
    const result = rows[0];
    if (result.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    res.json(result[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error or stored procedure missing' });
  }
});

module.exports = router;
