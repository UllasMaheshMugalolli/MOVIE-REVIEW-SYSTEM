const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// POST /api/ratings - Submit a new rating (PROTECTED - requires authentication)
router.post('/', authenticateToken, async (req, res) => {
  const { movie_id, numeric_rating, verbal_rating } = req.body;
  const user_id = req.user.user_id; // Get user_id from JWT token

  if (!movie_id || !numeric_rating) {
    return res.status(400).json({ error: 'movie_id and numeric_rating are required' });
  }

  if (numeric_rating < 1 || numeric_rating > 10) {
    return res.status(400).json({ error: 'numeric_rating must be between 1 and 10' });
  }

  try {
    // Generate a unique rating_id - get max rating_id and increment
    const [[maxResult]] = await pool.query('SELECT IFNULL(MAX(rating_id), 0) + 1 AS next_id FROM Rating');
    const rating_id = maxResult.next_id;
    
    const [result] = await pool.query(
      `INSERT INTO Rating (rating_id, movie_id, user_id, rating_date, numeric_rating, verbal_rating)
       VALUES (?, ?, ?, CURDATE(), ?, ?)`,
      [rating_id, movie_id, user_id, numeric_rating, verbal_rating || null]
    );

    res.status(201).json({ 
      message: 'Rating submitted successfully',
      rating_id: rating_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/ratings/movie/:movieId - Get all ratings for a specific movie
router.get('/movie/:movieId', async (req, res) => {
  const movie_id = req.params.movieId;
  
  try {
    const [ratings] = await pool.query(
      `SELECT r.rating_id, r.movie_id, r.user_id, u.username, r.numeric_rating, r.verbal_rating, r.rating_date
       FROM Rating r
       JOIN UserTable u ON r.user_id = u.user_id
       WHERE r.movie_id = ?
       ORDER BY r.rating_date DESC`,
      [movie_id]
    );
    
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/ratings/user - Get all ratings by the logged-in user (PROTECTED)
router.get('/user', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  
  try {
    const [ratings] = await pool.query(
      `SELECT r.rating_id, r.movie_id, m.title, r.numeric_rating, r.verbal_rating, r.rating_date
       FROM Rating r
       JOIN Movie m ON r.movie_id = m.movie_id
       WHERE r.user_id = ?
       ORDER BY r.rating_date DESC`,
      [user_id]
    );
    
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/ratings/:id - Update a rating (PROTECTED - user can only update their own ratings)
router.put('/:id', authenticateToken, async (req, res) => {
  const rating_id = req.params.id;
  const user_id = req.user.user_id;
  const { numeric_rating, verbal_rating } = req.body;

  if (!numeric_rating) {
    return res.status(400).json({ error: 'numeric_rating is required' });
  }

  if (numeric_rating < 1 || numeric_rating > 10) {
    return res.status(400).json({ error: 'numeric_rating must be between 1 and 10' });
  }

  try {
    // Check if rating exists and belongs to the user
    const [[rating]] = await pool.query(
      'SELECT user_id FROM Rating WHERE rating_id = ?',
      [rating_id]
    );

    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (rating.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only update your own ratings' });
    }

    // Update the rating
    await pool.query(
      `UPDATE Rating 
       SET numeric_rating = ?, verbal_rating = ?, rating_date = CURDATE()
       WHERE rating_id = ?`,
      [numeric_rating, verbal_rating || null, rating_id]
    );

    res.json({ 
      message: 'Rating updated successfully',
      rating_id: rating_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/ratings/:id - Delete a rating (PROTECTED - user can only delete their own ratings)
router.delete('/:id', authenticateToken, async (req, res) => {
  const rating_id = req.params.id;
  const user_id = req.user.user_id;

  try {
    // Check if rating exists and belongs to the user
    const [[rating]] = await pool.query(
      'SELECT user_id FROM Rating WHERE rating_id = ?',
      [rating_id]
    );

    if (!rating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (rating.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own ratings' });
    }

    // Delete the rating
    await pool.query('DELETE FROM Rating WHERE rating_id = ?', [rating_id]);

    res.json({ 
      message: 'Rating deleted successfully',
      rating_id: rating_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
