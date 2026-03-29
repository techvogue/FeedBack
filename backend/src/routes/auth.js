const express = require("express");
const passport = require("passport");
const upload = require("../config/multer");
const { authLimiter, uploadLimiter } = require("../middleware/rateLimit");
const validateRequest = require("../middleware/validateRequest");
const { requireAuth } = require("../middleware/auth");
const {
  registerSchema,
  loginSchema,
  googleRedirectQuerySchema,
} = require("../validation/authSchemas");
const {
  register,
  login,
  getProfile,
  updateProfilePicture,
  googleCallback,
} = require("../controllers/authController");

const router = express.Router();

// Register route with optional profile picture upload
router.post(
  "/register",
  authLimiter,
  uploadLimiter,
  upload.single("profilePicture"),
  validateRequest({ body: registerSchema }),
  register,
);

// Login route
router.post(
  "/login",
  authLimiter,
  validateRequest({ body: loginSchema }),
  login,
);

// Google OAuth routes
router.get(
  "/google",
  validateRequest({ query: googleRedirectQuerySchema }),
  (req, res, next) => {
    // Store redirect parameter in session
    if (req.query.redirect) {
      req.session.redirect = req.query.redirect;
    }
    authLimiter(req, res, (limitErr) => {
      if (limitErr) {
        return next(limitErr);
      }

      passport.authenticate("google", { scope: ["profile", "email"] })(
        req,
        res,
        next,
      );
    });
  },
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback,
);

// Protected routes (require JWT)
router.get("/profile", requireAuth, getProfile);
router.post(
  "/profile-picture",
  requireAuth,
  uploadLimiter,
  upload.single("profilePicture"),
  updateProfilePicture,
);

module.exports = router;
