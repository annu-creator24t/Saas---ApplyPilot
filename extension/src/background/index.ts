const API_BASE_URL = "http://localhost:8000";

console.log("[ApplyPilot Background Worker] Initialized.");

chrome.runtime.onMessage.addListener(
  (
    message: { action: string; payload: any },
    _sender: any,
    sendResponse: (response?: any) => void
  ) => {
    if (message.action === "VERIFY_TOKEN") {
      handleVerifyToken()
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (message.action === "LOGIN") {
      handleLogin(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (message.action === "FETCH_RESUMES") {
      handleFetchResumes()
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

    if (message.action === "GENERATE_COVER_LETTER") {
      handleGenerateCoverLetter(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (message.action === "GENERATE_INTERVIEW_QUESTIONS") {
      handleGenerateInterviewQuestions(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    if (message.action === "GENERATE_RESUME_IMPROVEMENT") {
      handleGenerateResumeImprovement(message.payload)
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

async function handleVerifyToken() {
  const token = await getStoredToken();
  if (!token) throw new Error("NOT_AUTHENTICATED");

  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to verify token.");
  }
  return json.data;
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

async function handleFetchResumes() {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const res = await fetch(`${API_BASE_URL}/resume`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to fetch resumes.");
  }
  return json.data || [];
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

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Job analysis failed.");
  }
  return json.data;
}

async function handleGenerateCoverLetter(payload: { resume_id: string; job_description: string }) {
  const token = await getStoredToken();
  if (!token) throw new Error("NOT_AUTHENTICATED");

  const res = await fetch(`${API_BASE_URL}/cover-letter/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to generate cover letter.");
  }
  return json.data;
}

async function handleGenerateInterviewQuestions(payload: { resume_id: string; job_description: string }) {
  const token = await getStoredToken();
  if (!token) throw new Error("NOT_AUTHENTICATED");

  const res = await fetch(`${API_BASE_URL}/interview/questions/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to generate interview questions.");
  }
  return json.data;
}

async function handleGenerateResumeImprovement(payload: { resume_id: string; job_description: string }) {
  const token = await getStoredToken();
  if (!token) throw new Error("NOT_AUTHENTICATED");

  const res = await fetch(`${API_BASE_URL}/resume-improvement/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to generate resume optimization.");
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

  if (res.status === 401 || res.status === 403) {
    await chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
    throw new Error("NOT_AUTHENTICATED");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.detail || json.message || "Failed to save application.");
  }
  return json.data;
}

