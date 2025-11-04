const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import route files
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');
const ratingsRouter = require('./routes/ratings');
const personsRouter = require('./routes/persons');
const genresRouter = require('./routes/genres');
const revenueRouter = require('./routes/revenue');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Movie Review System API' });
});

// Mount route handlers
app.use('/api/auth', authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/persons', personsRouter);
app.use('/api/genres', genresRouter);
app.use('/api/revenue', revenueRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
