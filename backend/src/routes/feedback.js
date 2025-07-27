const express = require('express');
const passport = require('passport');
const upload = require('../config/multer');
const feedbackController = require('../controllers/feedbackController');

const router = express.Router();

// Create or update feedback form (protected)
router.post(
  '/forms/:eventId',
  passport.authenticate('jwt', { session: false }),
  feedbackController.createOrUpdateFeedbackForm
);

// Get feedback form (public)
router.get(
  '/forms/:eventId',
  feedbackController.getFeedbackForm
);

// Submit feedback response (public)
router.post(
  '/responses/:eventId',
  feedbackController.submitFeedbackResponse
);

// Get feedback responses (protected, owner only)
router.get(
  '/responses/:eventId',
  passport.authenticate('jwt', { session: false }),
  feedbackController.getFeedbackResponses
);

// Upload file for feedback response (public)
router.post(
  '/upload',
  upload.single('file'),
  feedbackController.uploadFeedbackFile
);

module.exports = router; 