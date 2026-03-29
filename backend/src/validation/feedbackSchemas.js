const { z } = require("zod");

const eventIdParamSchema = z.object({
  eventId: z.string().uuid(),
});

const feedbackFormSchema = z.object({
  schema: z.record(z.any()).refine((value) => !Array.isArray(value), {
    message: "schema must be an object",
  }),
});

const submitFeedbackSchema = z.object({
  answers: z.record(z.any()).refine((value) => !Array.isArray(value), {
    message: "answers must be an object",
  }),
});

module.exports = {
  eventIdParamSchema,
  feedbackFormSchema,
  submitFeedbackSchema,
};
