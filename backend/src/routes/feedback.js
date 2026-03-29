const express = require("express");
const upload = require("../config/multer");
const {
  feedbackSubmissionLimiter,
  uploadLimiter,
} = require("../middleware/rateLimit");
const validateRequest = require("../middleware/validateRequest");
const {
  eventIdParamSchema,
  feedbackFormSchema,
  submitFeedbackSchema,
} = require("../validation/feedbackSchemas");
const feedbackController = require("../controllers/feedbackController");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// Health check (public)
router.get("/health", feedbackController.healthCheck);

// Create or update feedback form (protected)
router.post(
  "/forms/:eventId",
  requireAuth,
  validateRequest({ params: eventIdParamSchema, body: feedbackFormSchema }),
  feedbackController.createOrUpdateFeedbackForm,
);

// Create default feedback form (protected)
router.post(
  "/forms/:eventId/default",
  requireAuth,
  validateRequest({ params: eventIdParamSchema }),
  feedbackController.createDefaultFeedbackForm,
);

// Get event details for feedback form (public)
router.get(
  "/event/:eventId",
  validateRequest({ params: eventIdParamSchema }),
  feedbackController.getEventForFeedback,
);

// Get feedback form (public)
router.get(
  "/forms/:eventId",
  validateRequest({ params: eventIdParamSchema }),
  feedbackController.getFeedbackForm,
);

// Check if user has already submitted feedback (protected)
router.get(
  "/responses/:eventId/check",
  requireAuth,
  validateRequest({ params: eventIdParamSchema }),
  feedbackController.checkFeedbackSubmission,
);

// Submit feedback response (optional authentication - supports both authenticated and anonymous)
router.post(
  "/responses/:eventId",
  feedbackSubmissionLimiter,
  validateRequest({ params: eventIdParamSchema, body: submitFeedbackSchema }),
  // Try to authenticate, but don't fail if no token provided.
  optionalAuth,
  feedbackController.submitFeedbackResponse,
);

// Get feedback responses (protected, owner only)
router.get(
  "/responses/:eventId",
  requireAuth,
  validateRequest({ params: eventIdParamSchema }),
  feedbackController.getFeedbackResponses,
);

// Upload file for feedback response (authenticated)
router.post(
  "/upload",
  requireAuth,
  uploadLimiter,
  upload.single("file"),
  feedbackController.uploadFeedbackFile,
);

// Delete feedback form and all responses (protected, owner only)
router.delete(
  "/forms/:eventId",
  requireAuth,
  validateRequest({ params: eventIdParamSchema }),
  feedbackController.deleteFeedbackFormAndResponses,
);

module.exports = router;
