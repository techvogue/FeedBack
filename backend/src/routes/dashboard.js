const express = require('express');
const passport = require('passport');

const router = express.Router();

// Protected dashboard data route
router.get('/data', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    message: 'Protected dashboard data',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    },
    data: {
      events: [
        { id: 1, name: 'Tech Conference 2024', date: '2024-03-15' },
        { id: 2, name: 'Design Workshop', date: '2024-03-20' },
        { id: 3, name: 'Product Launch', date: '2024-03-25' },
      ],
      feedback: [
        { id: 1, eventId: 1, rating: 4.5, comment: 'Great event!' },
        { id: 2, eventId: 2, rating: 4.0, comment: 'Very informative' },
      ],
    },
  });
});

module.exports = router; 