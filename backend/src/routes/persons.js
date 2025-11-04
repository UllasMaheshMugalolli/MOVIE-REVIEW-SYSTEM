const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateAdmin } = require('../middleware/adminAuth');

// GET /api/persons - Get all persons
router.get('/', async (req, res) => {
  try {
    const [persons] = await pool.query('SELECT * FROM Person ORDER BY name');
    res.json(persons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/persons/:id - Get person details
router.get('/:id', async (req, res) => {
  const person_id = req.params.id;
  
  try {
    const [[person]] = await pool.query('SELECT * FROM Person WHERE person_id = ?', [person_id]);
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Get movies this person worked on with roles
    const [movies] = await pool.query(
      `SELECT m.movie_id, m.title, m.release_date, mpr.role
       FROM Movie m
       JOIN Movie_Person_Relationships mpr ON m.movie_id = mpr.movie_id
       WHERE mpr.person_id = ?
       ORDER BY m.release_date DESC`,
      [person_id]
    );

    // Get age using function
    const [ageResult] = await pool.query('SELECT GetPersonAge(?) AS age', [person_id]);

    res.json({
      person,
      age: ageResult[0].age,
      movies
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/persons/age/:personId - Get person's age using function
router.get('/age/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const [rows] = await pool.query('SELECT GetPersonAge(?) AS age', [personId]);
    const age = rows[0].age;
    if (age === null) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json({ person_id: personId, age });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error or function missing' });
  }
});

// POST /api/persons/movie-role - Add person to movie with role (ADMIN ONLY)
router.post('/movie-role', authenticateAdmin, async (req, res) => {
  const { movie_id, person_id, role } = req.body;

  if (!movie_id || !person_id || !role) {
    return res.status(400).json({ error: 'movie_id, person_id, and role are required' });
  }

  if (!['Actor', 'Director', 'Producer'].includes(role)) {
    return res.status(400).json({ error: 'role must be Actor, Director, or Producer' });
  }

  try {
    // Check if movie exists
    const [[movie]] = await pool.query('SELECT movie_id FROM Movie WHERE movie_id = ?', [movie_id]);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Check if person exists
    const [[person]] = await pool.query('SELECT person_id FROM Person WHERE person_id = ?', [person_id]);
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Add to Movie_Person_Relationships
    await pool.query(
      'INSERT INTO Movie_Person_Relationships (movie_id, person_id, role) VALUES (?, ?, ?)',
      [movie_id, person_id, role]
    );

    // Also add to specific role table if not already there
    if (role === 'Actor') {
      await pool.query('INSERT IGNORE INTO Actor (actor_id) VALUES (?)', [person_id]);
    } else if (role === 'Director') {
      await pool.query('INSERT IGNORE INTO Director (director_id) VALUES (?)', [person_id]);
    } else if (role === 'Producer') {
      await pool.query('INSERT IGNORE INTO Producer (producer_id) VALUES (?)', [person_id]);
    }

    res.status(201).json({ message: 'Person added to movie successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'This person already has this role for this movie' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/persons/movie-role - Remove person from movie role (ADMIN ONLY)
router.delete('/movie-role', authenticateAdmin, async (req, res) => {
  const { movie_id, person_id, role } = req.body;

  if (!movie_id || !person_id || !role) {
    return res.status(400).json({ error: 'movie_id, person_id, and role are required' });
  }

  try {
    const [result] = await pool.query(
      'DELETE FROM Movie_Person_Relationships WHERE movie_id = ? AND person_id = ? AND role = ?',
      [movie_id, person_id, role]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    res.json({ message: 'Person removed from movie role successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/persons - Add new person (ADMIN ONLY)
router.post('/', authenticateAdmin, async (req, res) => {
  const { name, date_of_birth, gender } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Generate person_id
    const [[maxResult]] = await pool.query('SELECT IFNULL(MAX(person_id), 0) + 1 AS next_id FROM Person');
    const person_id = maxResult.next_id;

    await pool.query(
      'INSERT INTO Person (person_id, name, date_of_birth, gender) VALUES (?, ?, ?, ?)',
      [person_id, name, date_of_birth || null, gender || null]
    );

    res.status(201).json({
      message: 'Person added successfully',
      person_id: person_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/persons/:id - Update person (ADMIN ONLY)
router.put('/:id', authenticateAdmin, async (req, res) => {
  const person_id = req.params.id;
  const { name, date_of_birth, gender } = req.body;

  if (!name && !date_of_birth && !gender) {
    return res.status(400).json({ error: 'At least one field (name, date_of_birth, or gender) is required' });
  }

  try {
    // Check if person exists
    const [[person]] = await pool.query('SELECT person_id FROM Person WHERE person_id = ?', [person_id]);
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (date_of_birth !== undefined) {
      updates.push('date_of_birth = ?');
      values.push(date_of_birth);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }

    values.push(person_id);

    await pool.query(
      `UPDATE Person SET ${updates.join(', ')} WHERE person_id = ?`,
      values
    );

    res.json({ message: 'Person updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/persons/:id - Delete person (ADMIN ONLY)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const person_id = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM Person WHERE person_id = ?', [person_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json({ message: 'Person deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ error: 'Cannot delete person. They are referenced in movies.' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
