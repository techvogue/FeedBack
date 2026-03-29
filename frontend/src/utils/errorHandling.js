export const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const isObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value);

const extractMessageFromPayload = (payload) => {
  if (!payload) return null;
  if (typeof payload === "string") return payload;

  if (Array.isArray(payload)) {
    const first = payload.find(
      (entry) => typeof entry === "string" && entry.trim().length > 0,
    );
    return first || null;
  }

  if (isObject(payload)) {
    if (typeof payload.message === "string" && payload.message.trim())
      return payload.message;
    if (typeof payload.error === "string" && payload.error.trim())
      return payload.error;

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      const firstError = payload.errors[0];
      if (typeof firstError === "string") return firstError;
      if (isObject(firstError) && typeof firstError.message === "string")
        return firstError.message;
    }
  }

  return null;
};

export const getApiErrorMessage = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
  const responseMessage = extractMessageFromPayload(error?.response?.data);
  if (responseMessage) return responseMessage;

  if (error?.code === "ECONNABORTED") {
    return "Request timed out. Please try again.";
  }

  if (
    typeof error?.message === "string" &&
    error.message.toLowerCase().includes("network")
  ) {
    return "Network error. Please check your internet connection.";
  }

  if (typeof error?.message === "string" && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const shouldRedirectToLogin = (error) => {
  if (error?.response?.status !== 401) return false;

  const currentPath = window.location.pathname;
  const authPages = ["/login", "/register", "/oauth-success"];
  if (authPages.some((route) => currentPath.startsWith(route))) return false;

  return true;
};

export const buildLoginRedirectUrl = () => {
  const current = `${window.location.pathname}${window.location.search || ""}`;
  return `/login?redirect=${encodeURIComponent(current)}`;
};
