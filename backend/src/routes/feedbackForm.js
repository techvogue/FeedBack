const express = require('express');
const passport = require('passport');
const feedbackFormController = require('../controllers/feedbackFormController');
const router = express.Router();

// Save-or-update (protected: owner only)
router.post(
  '/:eventId',
  passport.authenticate('jwt', { session: false }),
  feedbackFormController.saveFeedbackForm
);

// Public get: anyone can fetch form for an event
router.get('/:eventId', feedbackFormController.getFeedbackForm);

module.exports = router;
