const express = require('express');
const router = express.Router();
const pool = require('../db');

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

module.exports = router;
