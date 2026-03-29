const passport = require("passport");
const AppError = require("../utils/AppError");

const requireAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);

    if (!user) {
      return next(
        new AppError("Invalid authentication token", 401, "AUTH_INVALID_TOKEN"),
      );
    }

    req.user = user;
    return next();
  })(req, res, next);
};

const optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);

    req.user = user || undefined;
    return next();
  })(req, res, next);
};

module.exports = {
  requireAuth,
  optionalAuth,
};
