const { PrismaClient } = require('../../generated/prisma');
const cloudinary = require('../config/cloudinary');

const prisma = new PrismaClient();

// Create or update feedback form for an event
exports.createOrUpdateFeedbackForm = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { schema } = req.body;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create or update feedback form
    const feedbackForm = await prisma.feedbackForm.upsert({
      where: { eventId },
      update: { schema },
      create: { eventId, schema }
    });

    res.json({
      message: 'Feedback form saved successfully',
      feedbackForm
    });
  } catch (error) {
    console.error('Create/Update feedback form error:', error);
    res.status(500).json({ message: 'Failed to save feedback form' });
  }
};

// Get feedback form for an event (public)
exports.getFeedbackForm = async (req, res) => {
  try {
    const { eventId } = req.params;

    const feedbackForm = await prisma.feedbackForm.findUnique({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
            bannerUrl: true
          }
        }
      }
    });

    if (!feedbackForm) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    res.json(feedbackForm);
  } catch (error) {
    console.error('Get feedback form error:', error);
    res.status(500).json({ message: 'Failed to get feedback form' });
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
        userId
      }
    });

    res.json({
      hasSubmitted: !!existingResponse
    });
  } catch (error) {
    console.error('Check feedback submission error:', error);
    res.status(500).json({ message: 'Failed to check submission status' });
  }
};

// Submit feedback response
exports.submitFeedbackResponse = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    // Check if event and feedback form exist
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { feedbackForm: true }
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.feedbackForm) {
      return res.status(404).json({ message: 'Feedback form not found' });
    }

    // Check if user has already submitted feedback
    const existingResponse = await prisma.feedbackResponse.findFirst({
      where: {
        eventId,
        userId
      }
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }

    // Save feedback response
    const feedbackResponse = await prisma.feedbackResponse.create({
      data: {
        eventId,
        userId,
        answers
      }
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackResponse
    });
  } catch (error) {
    console.error('Submit feedback response error:', error);
    res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

// Get feedback responses for an event (owner only)
exports.getFeedbackResponses = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if event exists and user owns it
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    console.log(">>> [feedbackController] Event found:", event);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.ownerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const responses = await prisma.feedbackResponse.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(responses);
  } catch (error) {
    console.error('Get feedback responses error:', error);
    res.status(500).json({ message: 'Failed to get feedback responses' });
  }
};

// Upload file for feedback response
exports.uploadFeedbackFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = req.file.path;
    res.json({
      message: 'File uploaded successfully',
      fileUrl
    });
  } catch (error) {
    console.error('Upload feedback file error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
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
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.ownerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete all feedback responses for this event
    await prisma.feedbackResponse.deleteMany({ where: { eventId } });
    // Delete the feedback form for this event
    await prisma.feedbackForm.deleteMany({ where: { eventId } });

    res.json({ message: 'Feedback form and all responses deleted successfully.' });
  } catch (error) {
    console.error('Delete feedback form and responses error:', error);
    res.status(500).json({ message: 'Failed to delete feedback form and responses' });
  }
}; 