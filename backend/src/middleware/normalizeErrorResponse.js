const defaultCodeByStatus = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "UNPROCESSABLE_ENTITY",
  429: "RATE_LIMITED",
  500: "INTERNAL_ERROR",
};

const normalizeErrorResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (payload) => {
    if (res.statusCode >= 400) {
      let normalized = payload;

      if (
        normalized === null ||
        normalized === undefined ||
        typeof normalized !== "object" ||
        Array.isArray(normalized)
      ) {
        normalized = {
          message:
            normalized !== null && normalized !== undefined
              ? String(normalized)
              : "Request failed",
        };
      }

      if (normalized.success === undefined) {
        normalized.success = false;
      }

      if (!normalized.message) {
        normalized.message = "Request failed";
      }

      if (!normalized.code) {
        normalized.code =
          defaultCodeByStatus[res.statusCode] || `HTTP_${res.statusCode}`;
      }

      return originalJson(normalized);
    }

    return originalJson(payload);
  };

  next();
};

module.exports = normalizeErrorResponse;
