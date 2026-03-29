// backend/src/routes/aiRoutes.js
const express = require("express");
const aiFeedbackController = require("../controllers/aiFeedbackController");
const { requireAuth } = require("../middleware/auth");
const { aiLimiter } = require("../middleware/rateLimit");
const validateRequest = require("../middleware/validateRequest");
const { aiSummaryParamSchema } = require("../validation/aiSchemas");

const router = express.Router();

// Get AI summary for feedback
router.get(
  "/ai-summary/:eventId",
  requireAuth,
  aiLimiter,
  validateRequest({ params: aiSummaryParamSchema }),
  aiFeedbackController.getAISummary,
);

// Health check for Gemini API
router.get("/ai-health", requireAuth, aiLimiter, (req, res) => {
  const configured = Boolean(
    process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY,
  );
  res.json({
    status: configured ? "healthy" : "unavailable",
    geminiAvailable: configured,
    model: configured ? "gemini-1.5-flash" : null,
  });
});

module.exports = router;
