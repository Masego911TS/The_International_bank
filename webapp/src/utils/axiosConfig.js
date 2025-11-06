import axios from "axios";

// Create a single axios instance with default config
const axiosInstance = axios.create({
  withCredentials: true, // Enable cookies globally
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`[AXIOS] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[AXIOS] Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;