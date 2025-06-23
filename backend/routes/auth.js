// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validateInput = require('../utils/validateInput');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
});

const JWT_EXPIRE = '5d';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Register request payload:', req.body);
    //const { name, email, password, confirmPassword, role } = req.body;
    const { name, email, password, confirmPassword, role } = req.body;

    const { errors, isValid } = validateInput({ name, email, password, confirmPassword }, 'register');
    if (!isValid) {
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    console.log('Checking for existing user:', email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = new User({
      name,
      email,
      password,
    //   role: role || 'employee',
    });

   // console.log('Attempting to save user:', { name, email, role });
    console.log('Attempting to save user:', { name, email });
    await user.save();
    console.log('User saved successfully:', user._id);

    const token = generateToken(user._id);
    console.log('Token generated:', token);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
});

// Login route
router.post('/login', loginLimiter, async (req, res) => {
  try {
    console.log('Login request payload:', req.body);
    const { email, password } = req.body;

    const { errors, isValid } = validateInput({ email, password }, 'login');
    if (!isValid) {
      console.log('Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    console.log('Checking for user:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    console.log('Found user:', user._id);
    if (!user.isActive) {
      console.log('User is deactivated:', email);
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    console.log('Token generated:', token);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // role: user.role,
      },
      expiresIn: JWT_EXPIRE,
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
    });
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
});

// Verify token route
router.get('/verify-token', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        // role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
});

module.exports = router;