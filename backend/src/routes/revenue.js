const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateAdmin } = require('../middleware/adminAuth');

// GET /api/revenue/:movieId - Get revenue data for a movie
router.get('/:movieId', async (req, res) => {
  const movie_id = req.params.movieId;
  
  try {
    const [[revenue]] = await pool.query(
      'SELECT * FROM Revenue WHERE movie_id = ?',
      [movie_id]
    );
    
    if (!revenue) {
      return res.status(404).json({ error: 'Revenue data not found for this movie' });
    }
    
    res.json(revenue);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/revenue - Add revenue data (ADMIN ONLY)
router.post('/', authenticateAdmin, async (req, res) => {
  const { movie_id, investment, outcome_revenue } = req.body;

  if (!movie_id || investment === undefined || outcome_revenue === undefined) {
    return res.status(400).json({ error: 'movie_id, investment, and outcome_revenue are required' });
  }

  try {
    // Check if movie exists
    const [[movie]] = await pool.query('SELECT movie_id FROM Movie WHERE movie_id = ?', [movie_id]);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Generate revenue_id
    const [[maxResult]] = await pool.query('SELECT IFNULL(MAX(revenue_id), 0) + 1 AS next_id FROM Revenue');
    const revenue_id = maxResult.next_id;

    await pool.query(
      'INSERT INTO Revenue (revenue_id, movie_id, investment, outcome_revenue) VALUES (?, ?, ?, ?)',
      [revenue_id, movie_id, investment, outcome_revenue]
    );

    res.status(201).json({
      message: 'Revenue data added successfully',
      revenue_id: revenue_id
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Revenue data already exists for this movie' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/revenue/:movieId - Update revenue data (ADMIN ONLY)
router.put('/:movieId', authenticateAdmin, async (req, res) => {
  const movie_id = req.params.movieId;
  const { investment, outcome_revenue } = req.body;

  if (investment === undefined && outcome_revenue === undefined) {
    return res.status(400).json({ error: 'At least one field (investment or outcome_revenue) is required' });
  }

  try {
    // Check if revenue data exists
    const [[revenue]] = await pool.query('SELECT revenue_id FROM Revenue WHERE movie_id = ?', [movie_id]);
    if (!revenue) {
      return res.status(404).json({ error: 'Revenue data not found' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (investment !== undefined) {
      updates.push('investment = ?');
      values.push(investment);
    }
    if (outcome_revenue !== undefined) {
      updates.push('outcome_revenue = ?');
      values.push(outcome_revenue);
    }

    values.push(movie_id);

    await pool.query(
      `UPDATE Revenue SET ${updates.join(', ')} WHERE movie_id = ?`,
      values
    );

    res.json({ message: 'Revenue data updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
