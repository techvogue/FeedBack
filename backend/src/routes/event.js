const express = require('express');
const passport = require('passport');
const upload = require('../config/multer');
const eventController = require('../controllers/eventController');
const router = express.Router();

// Create Event
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.single('banner'),
  eventController.createEvent
);

// List User Events
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  eventController.getMyEvents
);

// Event details by ID
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  eventController.getEventById
);

module.exports = router;
