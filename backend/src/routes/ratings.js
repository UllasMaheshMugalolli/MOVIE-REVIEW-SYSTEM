const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/ratings - Submit a new rating
router.post('/', async (req, res) => {
  const { movie_id, user_id, numeric_rating, verbal_rating } = req.body;

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
      [rating_id, movie_id, user_id || null, numeric_rating, verbal_rating || null]
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

module.exports = router;
