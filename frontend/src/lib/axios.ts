import axios from "axios";

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = rawUrl.replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");

    if (token) {
      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else if (config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      const isAuthEndpoint =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/refresh");

      if (!isAuthEndpoint && typeof window !== "undefined") {
        const refreshToken = localStorage.getItem("refresh_token");

        if (refreshToken) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((newToken) => {
                if (originalRequest.headers && typeof originalRequest.headers.set === "function") {
                  originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
                } else if (originalRequest.headers) {
                  originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                }
                return api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const refreshRes = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            if (refreshRes.data?.data?.access_token) {
              const newAccessToken = refreshRes.data.data.access_token;
              const newRefreshToken =
                refreshRes.data.data.refresh_token || refreshToken;

              localStorage.setItem("access_token", newAccessToken);
              localStorage.setItem("refresh_token", newRefreshToken);
              document.cookie = `access_token=${newAccessToken}; path=/; max-age=604800; SameSite=Lax`;

              api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

              if (originalRequest.headers && typeof originalRequest.headers.set === "function") {
                originalRequest.headers.set("Authorization", `Bearer ${newAccessToken}`);
              } else if (originalRequest.headers) {
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              }

              processQueue(null, newAccessToken);
              return api(originalRequest);
            }
          } catch (refreshErr) {
            processQueue(refreshErr, null);
          } finally {
            isRefreshing = false;
          }
        }

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        const path = window.location.pathname;
        const isPublicPage =
          path === "/" ||
          path.startsWith("/login") ||
          path.startsWith("/signup") ||
          path.startsWith("/forgot-password");

        if (!isPublicPage) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;