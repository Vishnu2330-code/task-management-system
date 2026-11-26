import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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

export const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((token) => ({ accessToken: token }))
      .catch((err) => Promise.reject(err));
  }

  isRefreshing = true;

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const newAccessToken = data?.data?.accessToken;

    if (!newAccessToken) {
      throw new Error("No access token returned from refresh request");
    }

    localStorage.setItem("token", newAccessToken);
    api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
    processQueue(null, newAccessToken);
    return data.data;
  } catch (error) {
    processQueue(error, null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    const isPublic =
      window.location.pathname === "/" ||
      window.location.pathname.startsWith("/login") ||
      window.location.pathname === "/signup" ||
      window.location.pathname === "/forgot-password" ||
      window.location.pathname === "/reset-password";
    if (!isPublic) {
      window.location.href = "/login/member";
    }
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Request Interceptor: Attach memory/stored token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Automatic Refresh Token Rotation
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt to refresh for auth routes themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/signup") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
