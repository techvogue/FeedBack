const rateLimit = require("express-rate-limit");

/**
 * Custom key generator for rate limiting
 * Uses IP + internal flag to prevent internal flows from sharing limits with external users
 */
const createKeyGenerator = () => {
  return (req) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const isInternal = req.headers["x-internal-request"] === "true";
    // Internal requests get their own distinct bucket to prevent interference
    return isInternal ? `internal:${ip}` : `external:${ip}`;
  };
};

/**
 * Skip function to whitelist internal/test flows
 * Returns true to bypass rate limiting
 */
const skipInternal = (req) => {
  const internalHeader = req.headers["x-internal-request"];

  // Explicit false lets localhost callers simulate external traffic (useful for tests)
  if (internalHeader === "false") {
    return false;
  }

  // Skip rate limiting for internal/test requests marked with header
  if (internalHeader === "true") {
    return true;
  }
  // Skip rate limiting for localhost (development/testing)
  const ip = req.ip || req.socket.remoteAddress || "";
  if (ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1") {
    return true;
  }
  return false;
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  skip: skipInternal,
  keyGenerator: createKeyGenerator(),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    code: "RATE_LIMIT_AUTH",
  },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  skip: skipInternal,
  keyGenerator: createKeyGenerator(),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
    code: "RATE_LIMIT_AI",
  },
});

const feedbackSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  skip: skipInternal,
  keyGenerator: createKeyGenerator(),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many feedback submissions. Please try again later.",
    code: "RATE_LIMIT_FEEDBACK_SUBMISSION",
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  skip: skipInternal,
  keyGenerator: createKeyGenerator(),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many file uploads. Please try again later.",
    code: "RATE_LIMIT_UPLOAD",
  },
});

module.exports = {
  authLimiter,
  aiLimiter,
  feedbackSubmissionLimiter,
  uploadLimiter,
};
