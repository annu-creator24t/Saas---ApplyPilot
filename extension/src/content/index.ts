import { extractJobFromDOM } from "./extractors";

console.log("[ApplyPilot Content Script] Loaded on", window.location.hostname);

chrome.runtime.onMessage.addListener(
  (
    request: { action: string },
    _sender: any,
    sendResponse: (response?: any) => void
  ) => {
    if (request.action === "EXTRACT_JOB") {
      try {
        const data = extractJobFromDOM();
        sendResponse({ success: true, data });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    }
    return true;
  }
);
