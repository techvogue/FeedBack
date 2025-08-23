import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://feedback-uece.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // Do NOT set Content-Type here; let axios set it automatically for FormData
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and other errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 404 && error.config?.url?.includes('/feedback/forms/')) {
      // 404 for feedback forms is expected behavior - not a real error
      // We'll still reject the promise so the calling code can handle it,
      // but we won't log it as an error in the console
      console.debug('Feedback form not found (expected for new events):', error.config.url);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 