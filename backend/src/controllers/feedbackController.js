const prisma = require("../prismaClient");
const cloudinary = require("../config/cloudinary");

// Create or update feedback form for an event
exports.createOrUpdateFeedbackForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { schema } = req.body;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
    console.error("Create/Update feedback form error:", error);
    res.status(500).json({ message: "Failed to save feedback form" });
  }
};

// Get event details for feedback form (public)
exports.getEventForFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log(">>> [feedbackController] Getting event details for feedback form, eventId:", eventId);

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
      console.log(">>> [feedbackController] Event not found for eventId:", eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log(">>> [feedbackController] Event found:", event.title);
    res.json(event);
  } catch (error) {
    console.error(">>> [feedbackController] Get event for feedback error:", error);
    res.status(500).json({ message: "Failed to get event details" });
  }
};

// Get feedback form for an event (public)
exports.getFeedbackForm = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log(">>> [feedbackController] Getting feedback form for eventId:", eventId);

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
      console.log(">>> [feedbackController] Event not found for eventId:", eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log(">>> [feedbackController] Event found:", event.title);

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
      console.log(">>> [feedbackController] No feedback form found for eventId:", eventId);
      return res.status(404).json({
        message: "No feedback form found for this event",
        event: event,
        hasFeedbackForm: false
      });
    }

    console.log(">>> [feedbackController] Feedback form found, returning data");
    res.json(feedbackForm);
  } catch (error) {
    console.error(">>> [feedbackController] Get feedback form error:", error);
    res.status(500).json({ message: "Failed to get feedback form" });
  }
};

// Check if user has already submitted feedback
exports.checkFeedbackSubmission = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has already submitted feedback for this event
    const existingResponse = await prisma.feedbackResponse.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    res.json({
      hasSubmitted: !!existingResponse,
    });
  } catch (error) {
    console.error("Check feedback submission error:", error);
    res.status(500).json({ message: "Failed to check submission status" });
  }
};

// Submit feedback response (supports anonymous submissions)
exports.submitFeedbackResponse = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id; // Optional - can be undefined for anonymous submissions

    console.log(">>> [feedbackController] Submitting feedback response:", {
      eventId,
      userId,
      hasAnswers: !!answers,
      answersKeys: answers ? Object.keys(answers) : [],
      answersData: answers,
    });

    // Validate required fields
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(eventId)) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }

    if (!answers || typeof answers !== "object") {
      return res
        .status(400)
        .json({ message: "Answers are required and must be an object" });
    }

    // Validate and sanitize answers data
    try {
      // Ensure answers is a valid JSON object
      const sanitizedAnswers = JSON.parse(JSON.stringify(answers));
      console.log(
        ">>> [feedbackController] Sanitized answers:",
        sanitizedAnswers
      );
    } catch (jsonError) {
      console.error(
        ">>> [feedbackController] Invalid JSON in answers:",
        jsonError
      );
      return res.status(400).json({ message: "Invalid answers data format" });
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log(">>> [feedbackController] Database connection successful");
    } catch (dbError) {
      console.error(
        ">>> [feedbackController] Database connection failed:",
        dbError
      );
      return res.status(500).json({
        message: "Database connection failed",
        error: dbError.message,
      });
    }

    // Check if event and feedback form exist
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { feedbackForm: true },
    });

    console.log(
      ">>> [feedbackController] Event found:",
      event ? { id: event.id, title: event.title } : null
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.feedbackForm) {
      return res.status(404).json({ message: "Feedback form not found" });
    }

    // Check if user has already submitted feedback (only for authenticated users)
    if (userId) {
      const existingResponse = await prisma.feedbackResponse.findFirst({
        where: {
          eventId,
          userId,
        },
      });

      if (existingResponse) {
        return res.status(400).json({
          message: "You have already submitted feedback for this event",
        });
      }
    }

    // Save feedback response
    console.log(
      ">>> [feedbackController] Creating feedback response with data:",
      {
        eventId,
        userId,
        answers,
      }
    );

    const feedbackResponse = await prisma.feedbackResponse.create({
      data: {
        eventId,
        userId, // Can be null for anonymous submissions
        answers,
      },
    });

    console.log(
      ">>> [feedbackController] Feedback response created:",
      feedbackResponse.id
    );

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedbackResponse,
    });
  } catch (error) {
    console.error(
      ">>> [feedbackController] Submit feedback response error:",
      error
    );
    console.error(">>> [feedbackController] Error details:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });
    res
      .status(500)
      .json({ message: "Failed to submit feedback", error: error.message });
  }
};

// Get feedback responses for an event (owner only)
exports.getFeedbackResponses = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    console.log(">>> [feedbackController] Event found:", event);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const responses = await prisma.feedbackResponse.findMany({
      where: { eventId },
      include: {
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
    console.error("Get feedback responses error:", error);
    res.status(500).json({ message: "Failed to get feedback responses" });
  }
};

// Upload file for feedback response
exports.uploadFeedbackFile = async (req, res) => {
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
          2
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

    console.log(">>> [feedbackController] File uploaded successfully:", {
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: fileUrl,
    });

    res.json({
      message: "File uploaded successfully",
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
    });
  } catch (error) {
    console.error(
      ">>> [feedbackController] Upload feedback file error:",
      error
    );

    // Handle specific error types
    if (error.message.includes("File type not supported")) {
      return res.status(400).json({
        message: "Invalid file type",
        error: error.message,
      });
    }

    if (error.message.includes("File format not supported")) {
      return res.status(400).json({
        message: "Invalid file format",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Failed to upload file",
      error:
        "An unexpected error occurred while uploading the file. Please try again.",
    });
  }
};

// Delete feedback form and all responses for an event (owner only)
exports.deleteFeedbackFormAndResponses = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete all feedback responses for this event
    await prisma.feedbackResponse.deleteMany({ where: { eventId } });
    // Delete the feedback form for this event
    await prisma.feedbackForm.deleteMany({ where: { eventId } });

    res.json({
      message: "Feedback form and all responses deleted successfully.",
    });
  } catch (error) {
    console.error("Delete feedback form and responses error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete feedback form and responses" });
  }
};

// Health check for feedback system
exports.healthCheck = async (req, res) => {
  try {
    res.json({
      status: 'OK',
      message: 'Feedback system is running',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Feedback system error',
      error: error.message
    });
  }
};

// Create a default feedback form for an event
exports.createDefaultFeedbackForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    console.log(">>> [feedbackController] Creating default feedback form for eventId:", eventId);

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized - you can only create feedback forms for your own events" });
    }

    // Check if feedback form already exists
    const existingForm = await prisma.feedbackForm.findUnique({
      where: { eventId },
    });

    if (existingForm) {
      return res.status(400).json({ message: "Feedback form already exists for this event" });
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
              defaultValue: 5
            },
            {
              type: "comment",
              name: "feedback",
              title: "Please share your feedback about this event",
              isRequired: true,
              maxLength: 1000
            },
            {
              type: "radiogroup",
              name: "wouldRecommend",
              title: "Would you recommend this event to others?",
              isRequired: true,
              choices: [
                { value: "yes", text: "Yes, definitely!" },
                { value: "maybe", text: "Maybe, with some improvements" },
                { value: "no", text: "No, I wouldn't recommend it" }
              ]
            },
            {
              type: "comment",
              name: "suggestions",
              title: "What suggestions do you have for improving future events?",
              isRequired: false,
              maxLength: 500
            }
          ]
        }
      ]
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

    console.log(">>> [feedbackController] Default feedback form created successfully");

    res.status(201).json({
      message: "Default feedback form created successfully",
      feedbackForm,
    });
  } catch (error) {
    console.error(">>> [feedbackController] Create default feedback form error:", error);
    res.status(500).json({ message: "Failed to create default feedback form" });
  }
};
