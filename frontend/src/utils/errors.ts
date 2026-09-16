/**
 * Centralized API Error Parser for ApplyPilot.
 * Extracts clean, user-friendly error messages from Axios / fetch errors
 * without exposing technical traces or internals.
 */

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  const err = error as any;

  // 1. Check for backend standardized error object: { error: { message, code } }
  if (err?.response?.data?.error?.message && typeof err.response.data.error.message === "string") {
    return err.response.data.error.message;
  }

  // 2. Check for top-level message: { message: "..." }
  if (err?.response?.data?.message && typeof err.response.data.message === "string") {
    return err.response.data.message;
  }

  // 3. Check for FastAPI validation detail: { detail: "..." } or { detail: [{ msg, loc }] }
  if (err?.response?.data?.detail) {
    const detail = err.response.data.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const messages = detail
        .map((d: any) => (typeof d === "string" ? d : d.msg || ""))
        .filter(Boolean);
      if (messages.length > 0) return messages.join("; ");
    }
  }

  // 4. Check for network connectivity or timeout issues
  if (
    err?.code === "ECONNABORTED" ||
    err?.message?.includes("timeout") ||
    err?.message?.toLowerCase().includes("network error") ||
    err?.code === "ERR_NETWORK"
  ) {
    return "Unable to connect to the server. Please check your internet connection and try again shortly.";
  }

  // 5. HTTP status code specific friendly messages
  const status = err?.response?.status;
  if (status === 401) {
    return "Your session has expired. Please log in again.";
  }
  if (status === 403) {
    return err?.response?.data?.error?.message || "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return err?.response?.data?.error?.message || "The requested resource was not found.";
  }
  if (status === 422) {
    return "Please check the submitted information and try again.";
  }
  if (status === 429) {
    return "Too many requests. Please wait a moment before trying again.";
  }
  if (status >= 500) {
    return "Server is temporarily unavailable. Please try again in a moment.";
  }

  // 6. Generic JS Error message if clean
  if (err instanceof Error && err.message && !err.message.includes("Object") && !err.message.includes("JSON")) {
    return err.message;
  }

  return fallbackMessage;
}
