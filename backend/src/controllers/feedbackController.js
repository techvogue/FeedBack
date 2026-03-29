const prisma = require("../prismaClient");
const AppError = require("../utils/AppError");

// Create or update feedback form for an event
exports.createOrUpdateFeedbackForm = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { schema } = req.body;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { ownerId: true },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Create or update feedback form
    const feedbackForm = await prisma.feedbackForm.upsert({
      where: { eventId },
      update: { schema },
      create: { eventId, schema },
    });

    res.json({
      message: "Feedback form saved successfully",
      feedbackForm,
    });
  } catch (error) {
    next(error);
  }
};

// Get event details for feedback form (public)
exports.getEventForFeedback = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        bannerUrl: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Get feedback form for an event (public)
exports.getFeedbackForm = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // First check if the event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        bannerUrl: true,
        ownerId: true,
      },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if feedback form exists
    const feedbackForm = await prisma.feedbackForm.findUnique({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            bannerUrl: true,
            ownerId: true,
          },
        },
      },
    });

    if (!feedbackForm) {
      return res.status(404).json({
        message: "No feedback form found for this event",
        event: event,
        hasFeedbackForm: false,
      });
    }

    res.json(feedbackForm);
  } catch (error) {
    next(error);
  }
};

// Check if user has already submitted feedback
exports.checkFeedbackSubmission = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has already submitted feedback for this event
    const existingResponse = await prisma.feedbackResponse.findFirst({
      where: {
        eventId,
        userId,
      },
      select: { id: true },
    });

    res.json({
      hasSubmitted: !!existingResponse,
    });
  } catch (error) {
    next(error);
  }
};

// Submit feedback response (supports anonymous submissions)
exports.submitFeedbackResponse = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id; // Optional - can be undefined for anonymous submissions

    // Check if event and feedback form exist
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        feedbackForm: {
          select: { id: true },
        },
      },
    });

    if (!event) {
      return next(new AppError("Event not found", 404, "EVENT_NOT_FOUND"));
    }

    if (!event.feedbackForm) {
      return next(
        new AppError("Feedback form not found", 404, "FEEDBACK_FORM_NOT_FOUND"),
      );
    }

    // Check if user has already submitted feedback (only for authenticated users)
    if (userId) {
      const existingResponse = await prisma.feedbackResponse.findFirst({
        where: {
          eventId,
          userId,
        },
        select: { id: true },
      });

      if (existingResponse) {
        return next(
          new AppError(
            "You have already submitted feedback for this event",
            409,
            "DUPLICATE_FEEDBACK_SUBMISSION",
          ),
        );
      }
    }

    // Save feedback response and guard against concurrent duplicate submissions.
    let feedbackResponse;
    try {
      feedbackResponse = await prisma.feedbackResponse.create({
        data: {
          eventId,
          userId, // Can be null for anonymous submissions
          answers,
        },
      });
    } catch (createError) {
      if (createError?.code === "P2002" && userId) {
        return next(
          new AppError(
            "You have already submitted feedback for this event",
            409,
            "DUPLICATE_FEEDBACK_SUBMISSION",
          ),
        );
      }
      throw createError;
    }

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackResponse,
    });
  } catch (error) {
    next(error);
  }
};

// Get feedback responses for an event (owner only)
exports.getFeedbackResponses = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { ownerId: true },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const responses = await prisma.feedbackResponse.findMany({
      where: { eventId },
      select: {
        id: true,
        eventId: true,
        userId: true,
        answers: true,
        submittedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    res.json(responses);
  } catch (error) {
    next(error);
  }
};

// Upload file for feedback response
exports.uploadFeedbackFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
        error: "Please select a file to upload",
      });
    }

    // Additional validation
    const file = req.file;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return res.status(413).json({
        message: "File too large",
        error: `File size (${(file.size / (1024 * 1024)).toFixed(
          2,
        )}MB) exceeds the maximum allowed size of 5MB`,
      });
    }

    // Check if file was successfully uploaded to Cloudinary
    if (!file.path) {
      return res.status(500).json({
        message: "File upload failed",
        error: "Failed to upload file to cloud storage",
      });
    }

    const fileUrl = file.path;

    res.json({
      message: "File uploaded successfully",
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
    });
  } catch (error) {
    // Handle specific error types
    if (error.message?.includes("File type not supported")) {
      return res.status(400).json({
        message: "Invalid file type",
        error: error.message,
      });
    }

    if (error.message?.includes("File format not supported")) {
      return res.status(400).json({
        message: "Invalid file format",
        error: error.message,
      });
    }

    next(error);
  }
};

// Delete feedback form and all responses for an event (owner only)
exports.deleteFeedbackFormAndResponses = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { ownerId: true },
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Run both destructive operations atomically to avoid partial deletes.
    await prisma.$transaction([
      prisma.feedbackResponse.deleteMany({ where: { eventId } }),
      prisma.feedbackForm.deleteMany({ where: { eventId } }),
    ]);

    res.json({
      message: "Feedback form and all responses deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Health check for feedback system
exports.healthCheck = async (req, res, next) => {
  try {
    res.json({
      status: "OK",
      message: "Feedback system is running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// Create a default feedback form for an event
exports.createDefaultFeedbackForm = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { ownerId: true },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({
        message:
          "Unauthorized - you can only create feedback forms for your own events",
      });
    }

    // Check if feedback form already exists
    const existingForm = await prisma.feedbackForm.findUnique({
      where: { eventId },
      select: { id: true },
    });

    if (existingForm) {
      return res
        .status(400)
        .json({ message: "Feedback form already exists for this event" });
    }

    // Create a default feedback form schema
    const defaultSchema = {
      pages: [
        {
          name: "page1",
          elements: [
            {
              type: "text",
              name: "overallRating",
              title: "How would you rate this event overall?",
              isRequired: true,
              inputType: "number",
              min: 1,
              max: 10,
              defaultValue: 5,
            },
            {
              type: "comment",
              name: "feedback",
              title: "Please share your feedback about this event",
              isRequired: true,
              maxLength: 1000,
            },
            {
              type: "radiogroup",
              name: "wouldRecommend",
              title: "Would you recommend this event to others?",
              isRequired: true,
              choices: [
                { value: "yes", text: "Yes, definitely!" },
                { value: "maybe", text: "Maybe, with some improvements" },
                { value: "no", text: "No, I wouldn't recommend it" },
              ],
            },
            {
              type: "comment",
              name: "suggestions",
              title:
                "What suggestions do you have for improving future events?",
              isRequired: false,
              maxLength: 500,
            },
          ],
        },
      ],
    };

    // Create the feedback form
    const feedbackForm = await prisma.feedbackForm.create({
      data: {
        eventId,
        schema: defaultSchema,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            bannerUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Default feedback form created successfully",
      feedbackForm,
    });
  } catch (error) {
    next(error);
  }
};
