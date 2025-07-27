const express = require('express');
const passport = require('passport');
const upload = require('../config/multer');
const {
  register,
  login,
  getProfile,
  updateProfilePicture,
  googleCallback,
} = require('../controllers/authController');

const router = express.Router();

// Register route with optional profile picture upload
router.post('/register', upload.single('profilePicture'), register);

// Login route
router.post('/login', login);

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Store redirect parameter in session
  if (req.query.redirect) {
    req.session.redirect = req.query.redirect;
    console.log('Stored redirect in session:', req.query.redirect);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

// Protected routes (require JWT)
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);
router.post('/profile-picture',
  passport.authenticate('jwt', { session: false }),
  upload.single('profilePicture'),
  updateProfilePicture
);

module.exports = router;
