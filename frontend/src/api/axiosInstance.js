import axios from "axios";
import {
  buildLoginRedirectUrl,
  getApiErrorMessage,
  shouldRedirectToLogin,
} from "../utils/errorHandling";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://feedback-uece.onrender.com/api";

export const buildApiUrl = (path) => {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Do NOT set Content-Type here; let axios set it automatically for FormData
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration and other errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    error.userMessage = getApiErrorMessage(error);

    if (shouldRedirectToLogin(error)) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = buildLoginRedirectUrl();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
