const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
});

const googleRedirectQuerySchema = z.object({
  redirect: z
    .string()
    .trim()
    .max(512)
    .regex(/^\//, "redirect must start with '/'")
    .optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleRedirectQuerySchema,
};
