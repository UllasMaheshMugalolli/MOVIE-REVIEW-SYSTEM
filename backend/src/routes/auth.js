const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if username already exists
    const [[existingUser]] = await pool.query(
      'SELECT user_id FROM UserTable WHERE username = ?',
      [username]
    );

    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate user_id
    const [[maxResult]] = await pool.query('SELECT IFNULL(MAX(user_id), 0) + 1 AS next_id FROM UserTable');
    const user_id = maxResult.next_id;

    // Insert user (Note: we need to add email and password columns to UserTable)
    await pool.query(
      'INSERT INTO UserTable (user_id, username, email, password) VALUES (?, ?, ?, ?)',
      [user_id, username, email, hashedPassword]
    );

    // Generate JWT token
    const token = jwt.sign(
      { user_id, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { user_id, username, email }
    });
  } catch (err) {
    console.error(err);
    // Check if error is due to missing columns
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Database schema needs update. Please run: ALTER TABLE UserTable ADD COLUMN email VARCHAR(255) UNIQUE, ADD COLUMN password VARCHAR(255);' 
      });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [[user]] = await pool.query(
      'SELECT user_id, username, email, password FROM UserTable WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { user_id: user.user_id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({ 
        error: 'Database schema needs update. Please run: ALTER TABLE UserTable ADD COLUMN email VARCHAR(255) UNIQUE, ADD COLUMN password VARCHAR(255);' 
      });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
