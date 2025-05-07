const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Import your User model here
// const User = require('../models/user');

// JWT Secret - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';

// Generate tokens
function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, roles: user.roles },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

// Signup route
router.post(
  '/signup',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('fullName').notEmpty().withMessage('Full name is required'),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, fullName, roles } = req.body;
      
      // Check if email already exists
      // const existingUser = await User.findOne({ email });
      // if (existingUser) {
      //   return res.status(400).json({ message: 'Email already in use' });
      // }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create new user
      // const user = new User({
      //   email,
      //   password: hashedPassword,
      //   fullName,
      //   roles: roles || { student: true }
      // });
      
      // await user.save();
      
      // For now, mock a response
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      
      // Find user by email
      // const user = await User.findOne({ email });
      // if (!user) {
      //   return res.status(401).json({ message: 'Invalid credentials' });
      // }
      
      // Check password
      // const isPasswordValid = await bcrypt.compare(password, user.password);
      // if (!isPasswordValid) {
      //   return res.status(401).json({ message: 'Invalid credentials' });
      // }
      
      // Mock user for now
      const mockUser = {
        id: '12345',
        email,
        fullName: 'Mock User',
        roles: { student: true }
      };
      
      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(mockUser);
      
      // Store refresh token in database
      // user.refreshToken = refreshToken;
      // await user.save();
      
      res.json({
        user: mockUser,
        accessToken,
        refreshToken
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Refresh token route
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    // Find user by id
    // const user = await User.findById(decoded.id);
    // if (!user || user.refreshToken !== refreshToken) {
    //   return res.status(403).json({ message: 'Invalid refresh token' });
    // }
    
    // Mock user for now
    const mockUser = {
      id: decoded.id,
      email: 'user@example.com',
      roles: { student: true }
    };
    
    // Generate new access token
    const accessToken = jwt.sign(
      { id: mockUser.id, email: mockUser.email, roles: mockUser.roles },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user by id
    // const user = await User.findById(decoded.id);
    // if (!user) {
    //   return res.status(404).json({ message: 'User not found' });
    // }
    
    // Mock user for now
    const mockUser = {
      id: decoded.id,
      email: decoded.email,
      fullName: 'Mock User',
      roles: decoded.roles
    };
    
    res.json(mockUser);
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Invalid token' });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }
  
  try {
    // Find user with this refresh token and clear it
    // await User.findOneAndUpdate(
    //   { refreshToken },
    //   { refreshToken: null }
    // );
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 