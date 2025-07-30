// backend/src/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiFeedbackController');

router.get('/ai-feedback-summary/:eventId', aiController.getAISummary);

module.exports = router;
