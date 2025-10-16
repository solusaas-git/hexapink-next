"use client";

import axios from "axios";
import { toast } from "react-toastify";

// Load the API URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update response interceptor
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
          await axios.post(
            `${apiUrl}/auth/refresh-token`,
            {},
            { withCredentials: true }
          );

          return api(originalRequest);
        } catch {
          if (typeof window !== "undefined") {
            toast.error("Session expired. Please log in again.");
            window.location.replace("/login");
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export const formApi = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});

// Add a request interceptor for formApi
formApi.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Update response interceptor for formApi
formApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      if (typeof window !== "undefined") {
        toast.error("Your session has expired. Please log in again.");
        localStorage.removeItem("currentUser");
        window.location.replace("/login");
      }
    } else if (error.response && error.response.status === 401) {
      const errorType = error.response.data.errorType;
      if (errorType === "TOKEN_EXPIRED") {
        if (typeof window !== "undefined") {
          toast.error("Your session has expired. Please log in again.");
          localStorage.removeItem("currentUser");
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

