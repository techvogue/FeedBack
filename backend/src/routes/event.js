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

// Get all public events (no authentication required)
router.get('/public', eventController.getPublicEvents);

// Event details by ID (public for feedback forms)
router.get('/:id', eventController.getEventById);

// Update event by ID
router.patch(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  upload.single('banner'),
  eventController.updateEvent
);

// Delete event by ID
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  eventController.deleteEvent
);

module.exports = router;
