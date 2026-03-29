// src/controllers/eventController.js

// Only import PrismaClient, as manual Cloudinary upload is removed.
// If you need cloudinary for other operations (e.g., deleting banners later), you can uncomment:
// const cloudinary = require('../config/cloudinary');
const prisma = require("../prismaClient");

// Create Event (expecting 'banner' as multipart image field processed by multer-storage-cloudinary)
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, time } = req.body;
    const ownerId = req.user.id; // Assuming authenticate middleware sets req.user

    let bannerUrl = null;

    // --- CRITICAL FIX APPLIED HERE ---
    // multer-storage-cloudinary already uploaded the file.
    // The Cloudinary URL is available in req.file.path (or sometimes req.file.url).
    if (req.file) {
      bannerUrl = req.file.path;
      console.log("Backend: Captured banner URL:", bannerUrl);
    } else {
      console.warn(
        "Backend: No banner file was provided or processed by Multer. bannerUrl will be null.",
      );
    }
    // --- END FIX ---

    // Combine date and time
    const dateTime = new Date(`${date}T${time}`);

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: dateTime,
        bannerUrl: bannerUrl || "", // Save the obtained URL (or an empty string if none)
        owner: {
          connect: { id: ownerId },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    next(err);
  }
};

// List all events owned by the user (This part remains unchanged as it was correct)
exports.getMyEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { ownerId: req.user.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
};

// Get all public events (no authentication required)
exports.getPublicEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    res.json(events);
  } catch (err) {
    next(err);
  }
};

// Get event details by ID
exports.getEventById = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        feedbackForm: {
          select: {
            id: true,
            eventId: true,
          },
        },
      },
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (err) {
    next(err);
  }
};

// Update event by ID
exports.updateEvent = async (req, res, next) => {
  try {
    const { title, description, date, time } = req.body;
    const eventId = req.params.id; // Remove parseInt since id is a String (UUID)
    const userId = req.user.id;

    // Find event and check ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        ownerId: true,
        title: true,
        description: true,
        date: true,
        bannerUrl: true,
      },
    });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.ownerId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let bannerUrl = event.bannerUrl;
    if (req.file) {
      bannerUrl = req.file.path;
    }

    // Combine date and time if provided
    let dateTime = event.date;
    if (date && time) {
      dateTime = new Date(`${date}T${time}`);
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title ?? event.title,
        description: description ?? event.description,
        date: dateTime,
        bannerUrl,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (err) {
    next(err);
  }
};

// Delete event by ID
exports.deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id; // Remove parseInt since id is a String (UUID)
    const userId = req.user.id;
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
    await prisma.$transaction([
      prisma.feedbackResponse.deleteMany({ where: { eventId } }),
      prisma.feedbackForm.deleteMany({ where: { eventId } }),
      prisma.event.delete({ where: { id: eventId } }),
    ]);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    next(err);
  }
};
