const prisma = require('../prismaClient');

// Create or update feedback form (owner only)
exports.saveFeedbackForm = async (req, res) => {
  const { eventId } = req.params;
  const { schema } = req.body;
  // Confirm ownership
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.ownerId !== req.user.id) {
    return res.status(403).json({ message: "Not allowed" });
  }
  // Upsert form
  const feedbackForm = await prisma.feedbackForm.upsert({
    where: { eventId },
    update: { schema },
    create: { eventId, schema }
  });
  res.json(feedbackForm);
};

// Get feedback form schema (public)
exports.getFeedbackForm = async (req, res) => {
  const { eventId } = req.params;
  const form = await prisma.feedbackForm.findUnique({ where: { eventId } });
  if (!form) return res.status(404).json({ message: "No form" });
  res.json(form);
};
