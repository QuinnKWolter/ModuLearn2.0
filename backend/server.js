const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { sequelize } = require('./models');

// Routes
const authRoutes = require('./routes/auth');
// TODO: Import additional routes when implemented

// Middleware
const errorHandler = require('./middlewares/errorHandler');
// TODO: Import additional middleware when implemented

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Frontend URL
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
// TODO: Add additional routes when implemented

// Simple health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ModuLearn API is running' });
});

// Login endpoint (already implemented in authRoutes)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Implement login logic here - This will be handled by auth routes
  res.json({ message: 'Login successful' });
});

// Error handling middleware
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database models (set to false in production)
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

startServer();

module.exports = app; // For testing