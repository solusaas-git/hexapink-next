import axios from "axios";
import { toast } from "react-toastify";

// Load the backend URL from the .env file
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // No need to manually attach tokens; cookies will be sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update response interceptor for `api`
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      const originalRequest = error.config;

      if (!originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await axios.post(`${backendUrl}/api/auth/refresh-token`, {}, { withCredentials: true });

          return api(originalRequest); // Retry the original request
        } catch {
          toast.error("Session expired. Please log in again.");
          window.location.replace("/login"); // Use replace to avoid re-rendering the app
        }
      }
    }
    return Promise.reject(error);
  }
);

export const formApi = axios.create({
  baseURL: backendUrl,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Add a request interceptor for formApi as well
formApi.interceptors.request.use(
  (config) => {
    // No need to manually attach tokens; cookies will be sent automatically
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update response interceptor for `formApi`
formApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      // Handle token expiration gracefully
      toast.error("Your session has expired. Please log in again.");
      localStorage.removeItem("currentUser");
      window.location.replace("/login"); // Use replace to avoid re-rendering the app
    } else if (error.response && error.response.status === 401) {
      const errorType = error.response.data.errorType;
      if (errorType === "TOKEN_EXPIRED") {
        toast.error("Your session has expired. Please log in again.");
        localStorage.removeItem("currentUser");
        window.location.replace("/login"); // Use replace to avoid re-rendering the app
      }
    }
    return Promise.reject(error);
  }
);

export default api;
