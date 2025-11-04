const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateAdmin } = require('../middleware/adminAuth');

// GET /api/genres - Get all genres
router.get('/', async (req, res) => {
  try {
    const [genres] = await pool.query('SELECT * FROM Genre ORDER BY name');
    res.json(genres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/genres/:movieId - Get genres for a specific movie
router.get('/:movieId', async (req, res) => {
  const movie_id = req.params.movieId;
  
  try {
    const [genres] = await pool.query(
      `SELECT g.genre_id, g.name 
       FROM Genre g 
       JOIN Movie_Genre mg ON g.genre_id = mg.genre_id 
       WHERE mg.movie_id = ?`,
      [movie_id]
    );
    res.json(genres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/genres - Add new genre (ADMIN ONLY)
router.post('/', authenticateAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Genre name is required' });
  }

  try {
    // Generate genre_id
    const [[maxResult]] = await pool.query('SELECT IFNULL(MAX(genre_id), 0) + 1 AS next_id FROM Genre');
    const genre_id = maxResult.next_id;

    await pool.query(
      'INSERT INTO Genre (genre_id, name) VALUES (?, ?)',
      [genre_id, name]
    );

    res.status(201).json({
      message: 'Genre added successfully',
      genre_id: genre_id
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Genre already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/genres/movie - Assign genre to movie (ADMIN ONLY)
router.post('/movie', authenticateAdmin, async (req, res) => {
  const { movie_id, genre_id } = req.body;

  if (!movie_id || !genre_id) {
    return res.status(400).json({ error: 'movie_id and genre_id are required' });
  }

  try {
    await pool.query(
      'INSERT INTO Movie_Genre (movie_id, genre_id) VALUES (?, ?)',
      [movie_id, genre_id]
    );

    res.status(201).json({ message: 'Genre assigned to movie successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This genre is already assigned to this movie' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Movie or Genre not found' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/genres/movie - Remove genre from movie (ADMIN ONLY)
router.delete('/movie', authenticateAdmin, async (req, res) => {
  const { movie_id, genre_id } = req.body;

  if (!movie_id || !genre_id) {
    return res.status(400).json({ error: 'movie_id and genre_id are required' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM Movie_Genre WHERE movie_id = ? AND genre_id = ?',
      [movie_id, genre_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Genre assignment not found' });
    }

    res.json({ message: 'Genre removed from movie successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
