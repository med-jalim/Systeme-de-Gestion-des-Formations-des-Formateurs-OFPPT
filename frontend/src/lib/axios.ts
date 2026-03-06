import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for token (Keycloak integration later)
axiosInstance.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem("token");
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized, 403 Forbidden)
    if (error.response?.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // Logic to redirect or refresh token
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
