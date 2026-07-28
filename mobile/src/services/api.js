import axios from "axios";
import { getSecureItem, setSecureItem, deleteSecureItem } from "./storage";
import { Platform } from "react-native";

// Determine backend host for Expo simulator or device
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://localhost:5000/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if a token refresh is already in-flight to prevent race conditions
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Attach Authorization Bearer token from SecureStore
api.interceptors.request.use(
  async (config) => {
    const token = await getSecureItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with automatic token refresh on 401 TOKEN_EXPIRED
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If server says token expired and we haven't retried yet
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getSecureItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        if (res.data.success) {
          const { token: newToken, refreshToken: newRefreshToken } = res.data;
          await setSecureItem("token", newToken);
          await setSecureItem("refreshToken", newRefreshToken);

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);

        // Token refresh failed: clear stored tokens (force re-login)
        await deleteSecureItem("token");
        await deleteSecureItem("refreshToken");

        return Promise.reject(
          new Error("Session expired. Please log in again.")
        );
      } finally {
        isRefreshing = false;
      }
    }

    // Extract server error message or fallback
    const message =
      error.response?.data?.message ||
      "Network error. Please check your connection.";
    return Promise.reject(new Error(message));
  }
);

export default api;
