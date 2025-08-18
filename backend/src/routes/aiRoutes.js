// backend/src/routes/aiRoutes.js
const express = require('express');
const aiFeedbackController = require('../controllers/aiFeedbackController');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();

// Get AI summary for feedback
router.get('/ai-summary/:eventId', aiFeedbackController.getAISummary);

// Health check for Gemini API
router.get('/ai-health', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                status: 'unavailable',
                geminiAvailable: false,
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Test with a simple prompt
        const result = await model.generateContent("Hello");
        const response = await result.response;

        res.json({
            status: 'healthy',
            geminiAvailable: true,
            model: 'gemini-1.5-flash',
            testResponse: response.text()
        });
    } catch (error) {
        res.json({
            status: 'unavailable',
            geminiAvailable: false,
            error: error.message
        });
    }
});

module.exports = router;
