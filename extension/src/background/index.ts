const API_BASE_URL = "http://localhost:8000";

console.log("[ApplyPilot Background Worker] Initialized.");

chrome.runtime.onMessage.addListener(
  (
    message: { action: string; payload: any },
    _sender: any,
    sendResponse: (response?: any) => void
  ) => {
    if (message.action === "LOGIN") {
      handleLogin(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (message.action === "ANALYZE_JOB") {
      handleAnalyzeJob(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (message.action === "TRACK_APPLICATION") {
      handleTrackApplication(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
  }
);

async function getStoredToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["access_token"], (result: Record<string, any>) => {
      resolve(result.access_token || null);
    });
  });
}

async function handleLogin(credentials: any) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.detail || json.message || "Login failed.");
  }

  const token = json.data?.access_token;
  if (token) {
    await chrome.storage.local.set({ access_token: token, user: credentials.email });
  }
  return json.data;
}

async function handleAnalyzeJob(jobPayload: any) {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const res = await fetch(`${API_BASE_URL}/job/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobPayload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Job analysis failed.");
  }
  return json.data;
}

async function handleTrackApplication(appPayload: any) {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(appPayload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.detail || json.message || "Failed to save application.");
  }
  return json.data;
}
