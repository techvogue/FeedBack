const multer = require("multer");
const { Prisma } = require("../../generated/prisma");
const AppError = require("../utils/AppError");

const notFoundHandler = (req, res, next) => {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";
  let code = err.code || "INTERNAL_ERROR";

  if (err instanceof multer.MulterError) {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    code = err.code || "UPLOAD_ERROR";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the maximum allowed size of 5MB";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "You can only upload one file at a time";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Invalid file upload request";
    } else {
      message = err.message;
    }
  } else if (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientValidationError
  ) {
    if (err.code === "P2002") {
      statusCode = 409;
      code = "UNIQUE_CONSTRAINT_VIOLATION";
      message = "A record with this value already exists";
    } else if (err.code === "P2025") {
      statusCode = 404;
      code = "RECORD_NOT_FOUND";
      message = "Requested record was not found";
    } else {
      statusCode = 400;
      code = err.code || "DATABASE_ERROR";
      message = "Database operation failed";
    }
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    code = "TOKEN_EXPIRED";
    message = "Authentication token has expired";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    code = "INVALID_TOKEN";
    message = "Invalid authentication token";
  } else if (err.message && err.message.includes("File type not supported")) {
    statusCode = 400;
    code = "INVALID_FILE_TYPE";
    message = err.message;
  } else if (err.message && err.message.includes("File format not supported")) {
    statusCode = 400;
    code = "INVALID_FILE_FORMAT";
    message = err.message;
  }

  const payload = {
    success: false,
    message,
    code,
  };

  if (code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV === "development") {
    payload.error = err.message;
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
