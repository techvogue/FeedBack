const { z } = require("zod");

const aiSummaryParamSchema = z.object({
  eventId: z.string().uuid(),
});

module.exports = {
  aiSummaryParamSchema,
};
