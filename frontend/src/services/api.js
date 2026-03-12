import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — token attach karo ───────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor — 401 pe logout (but ignore auth requests) ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    // do not redirect if the 401 occurred while trying to authenticate
    // (login/register/verify-otp/etc). the login form itself handles
    // showing the error message and we don't want to reload the page.
    const isAuthEndpoint =
      config?.url?.includes("/auth/login") ||
      config?.url?.includes("/auth/register") ||
      config?.url?.includes("/auth/verify-otp");

    if (response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
