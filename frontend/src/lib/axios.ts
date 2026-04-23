import axios from "axios";
import keycloak from "@/lib/keycloak";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Inject Keycloak Bearer token on every request
axiosInstance.interceptors.request.use(
  async (config) => {
    if (keycloak.authenticated) {
      // Refresh token if expiring within 30s
      try {
        await keycloak.updateToken(30);
      } catch {
        keycloak.logout();
        return Promise.reject(new Error("Session expirée."));
      }
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — force re-login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      keycloak.logout();
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
