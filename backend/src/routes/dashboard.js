const express = require("express");
const prisma = require("../prismaClient");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Protected dashboard data route
router.get("/data", requireAuth, async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const [totalEvents, totalFeedback] = await Promise.all([
      prisma.event.count({
        where: { ownerId },
      }),
      prisma.feedbackResponse.count({
        where: {
          event: {
            ownerId,
          },
        },
      }),
    ]);

    res.json({
      totalEvents,
      totalFeedback,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
