const jwt = require('jsonwebtoken');
const pool = require('../db');

// Middleware to check if user is admin
const authenticateAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin in database
    const [[user]] = await pool.query(
      'SELECT user_id, username, email, is_admin FROM UserTable WHERE user_id = ?',
      [decoded.user_id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_admin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    // Attach user info to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { authenticateAdmin };
