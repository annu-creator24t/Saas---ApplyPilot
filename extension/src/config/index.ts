/**
 * Extension environment and endpoint configuration.
 *
 * Configurable via Vite environment variables (.env / .env.production / .env.local):
 * - VITE_API_URL: Backend API root URL (e.g. "https://api.yourdomain.com" or "http://localhost:8000")
 * - VITE_FRONTEND_URL: Web app URL (e.g. "https://app.yourdomain.com" or "http://localhost:3000")
 */

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://applypilot-backend-aar3.onrender.com";

export const FRONTEND_URL: string =
  (import.meta.env.VITE_FRONTEND_URL as string | undefined)?.replace(/\/+$/, "") ||
  "https://applypilot-jet.vercel.app";

/**
 * Returns active API base URL, checking chrome.storage.local for runtime overrides if set.
 */
export async function getApiBaseUrl(): Promise<string> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    try {
      const stored = await chrome.storage.local.get(["custom_api_url"]);
      if (stored.custom_api_url && typeof stored.custom_api_url === "string") {
        return stored.custom_api_url.replace(/\/+$/, "");
      }
    } catch {
      // fallback to build default
    }
  }
  return API_BASE_URL;
}

/**
 * Returns active Web App / Frontend URL.
 */
export async function getFrontendUrl(): Promise<string> {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    try {
      const stored = await chrome.storage.local.get(["custom_frontend_url"]);
      if (stored.custom_frontend_url && typeof stored.custom_frontend_url === "string") {
        return stored.custom_frontend_url.replace(/\/+$/, "");
      }
    } catch {
      // fallback to build default
    }
  }
  return FRONTEND_URL;
}
