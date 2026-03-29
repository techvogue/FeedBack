const express = require("express");
const upload = require("../config/multer");
const validateRequest = require("../middleware/validateRequest");
const { requireAuth } = require("../middleware/auth");
const {
  uuidParamSchema,
  createEventSchema,
  updateEventSchema,
} = require("../validation/eventSchemas");
const eventController = require("../controllers/eventController");
const router = express.Router();

// Create Event
router.post(
  "/",
  requireAuth,
  upload.single("banner"),
  validateRequest({ body: createEventSchema }),
  eventController.createEvent,
);

// List User Events
router.get("/", requireAuth, eventController.getMyEvents);

// Get all public events (no authentication required)
router.get("/public", eventController.getPublicEvents);

// Event details by ID (public for feedback forms)
router.get(
  "/:id",
  validateRequest({ params: uuidParamSchema }),
  eventController.getEventById,
);

// Update event by ID
router.patch(
  "/:id",
  requireAuth,
  upload.single("banner"),
  validateRequest({ params: uuidParamSchema, body: updateEventSchema }),
  eventController.updateEvent,
);

// Delete event by ID
router.delete(
  "/:id",
  requireAuth,
  validateRequest({ params: uuidParamSchema }),
  eventController.deleteEvent,
);

module.exports = router;
