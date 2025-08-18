require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const multer = require('multer');

// Import configurations
require('./config/passport-local')(passport);
require('./config/passport-jwt')(passport);
require('./config/passport-google')(passport);

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const feedbackRoutes = require('./routes/feedback');
const aiRoutes = require('./routes/aiRoutes');
const ticketRoutes = require('./routes/tickets');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Session middleware for OAuth redirect handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/events', require('./routes/event'));
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tickets', ticketRoutes);

app.use('/api', aiRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('>>> [app.js] Error middleware caught:', err);

  // Handle multer errors specifically
  if (err instanceof multer.MulterError) {
    console.error('>>> [app.js] Multer error:', err.code);

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({
          message: 'File too large',
          error: 'File size exceeds the maximum allowed size of 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          message: 'Too many files',
          error: 'You can only upload one file at a time'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          message: 'Unexpected file field',
          error: 'Invalid file upload request'
        });
      default:
        return res.status(400).json({
          message: 'File upload error',
          error: err.message
        });
    }
  }

  // Handle file filter errors
  if (err.message && err.message.includes('File type not supported')) {
    return res.status(400).json({
      message: 'Invalid file type',
      error: err.message
    });
  }

  // Handle file format errors
  if (err.message && err.message.includes('File format not supported')) {
    return res.status(400).json({
      message: 'Invalid file format',
      error: err.message
    });
  }

  // Handle other errors
  console.error('>>> [app.js] Unhandled error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;