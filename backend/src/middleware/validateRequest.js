const AppError = require("../utils/AppError");
const { ZodError } = require("zod");

const validateRequest = ({ body, params, query }) => {
  return (req, res, next) => {
    try {
      if (body) {
        req.body = body.parse(req.body);
      }

      if (params) {
        req.params = params.parse(req.params);
      }

      if (query) {
        req.query = query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          new AppError(
            "Request validation failed",
            400,
            "VALIDATION_ERROR",
            error.issues.map((issue) => ({
              path: issue.path.join("."),
              message: issue.message,
              code: issue.code,
            })),
          ),
        );
      }

      next(error);
    }
  };
};

module.exports = validateRequest;
