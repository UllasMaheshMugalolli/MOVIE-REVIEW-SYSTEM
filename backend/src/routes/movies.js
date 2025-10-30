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

// POST /api/movies - Add a new movie (simple version - can be expanded)
router.post('/', async (req, res) => {
  const { title, release_date } = req.body;

  if (!title || !release_date) {
    return res.status(400).json({ error: 'title and release_date are required' });
  }

  try {
    // Generate movie_id
    const [[maxResult]] = await pool.query('SELECT IFNULL(MAX(movie_id), 0) + 1 AS next_id FROM Movie');
    const movie_id = maxResult.next_id;

    await pool.query(
      'INSERT INTO Movie (movie_id, title, release_date, avg_rating) VALUES (?, ?, ?, 0.0)',
      [movie_id, title, release_date]
    );

    res.status(201).json({
      message: 'Movie added successfully',
      movie_id: movie_id
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Movie with this title already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/movies/:id - Update a movie
router.put('/:id', async (req, res) => {
  const movie_id = req.params.id;
  const { title, release_date } = req.body;

  if (!title && !release_date) {
    return res.status(400).json({ error: 'At least one field (title or release_date) is required' });
  }

  try {
    // Check if movie exists
    const [[movie]] = await pool.query('SELECT movie_id FROM Movie WHERE movie_id = ?', [movie_id]);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Build dynamic update query
    let updates = [];
    let values = [];
    
    if (title) {
      updates.push('title = ?');
      values.push(title);
    }
    if (release_date) {
      updates.push('release_date = ?');
      values.push(release_date);
    }
    
    values.push(movie_id);

    await pool.query(
      `UPDATE Movie SET ${updates.join(', ')} WHERE movie_id = ?`,
      values
    );

    res.json({ message: 'Movie updated successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Movie with this title already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/movies/:id - Delete a movie
router.delete('/:id', async (req, res) => {
  const movie_id = req.params.id;

  try {
    const [[movie]] = await pool.query('SELECT movie_id FROM Movie WHERE movie_id = ?', [movie_id]);
    
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Delete movie (cascade will delete related records)
    await pool.query('DELETE FROM Movie WHERE movie_id = ?', [movie_id]);

    res.json({ message: 'Movie deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/movies/:id/rating - Get movie's average rating (demonstrates trigger working)
router.get('/:id/rating', async (req, res) => {
  const movie_id = req.params.id;
  
  try {
    // Get movie with avg_rating (updated automatically by trigger)
    const [[movie]] = await pool.query(
      'SELECT movie_id, title, avg_rating FROM Movie WHERE movie_id = ?',
      [movie_id]
    );

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Get all ratings for this movie to show what the trigger calculated from
    const [ratings] = await pool.query(
      `SELECT r.rating_id, r.user_id, u.username, r.numeric_rating, r.verbal_rating, r.rating_date
       FROM Rating r
       LEFT JOIN UserTable u ON r.user_id = u.user_id
       WHERE r.movie_id = ?
       ORDER BY r.rating_date DESC`,
      [movie_id]
    );

    // Calculate expected average manually to show trigger is working correctly
    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.numeric_rating, 0);
    const calculatedAvg = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;

    res.json({
      movie_id: movie.movie_id,
      title: movie.title,
      avg_rating_from_trigger: movie.avg_rating,
      manually_calculated_avg: parseFloat(calculatedAvg),
      total_ratings: totalRatings,
      ratings: ratings,
      trigger_working: movie.avg_rating == calculatedAvg // Compare if trigger result matches manual calculation
    });
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
