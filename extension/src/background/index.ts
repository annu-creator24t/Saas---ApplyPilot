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

    if (message.action === "UPLOAD_RESUME") {
      handleUploadResume(message.payload)
        .then((res) => sendResponse({ success: true, data: res }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }

    return false;
  }
);

async function getStoredToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["access_token"], async (result: Record<string, any>) => {
      if (result.access_token) {
        return resolve(result.access_token);
      }

      // Fallback: Sync active session cookie from ApplyPilot web app (http://localhost:3000)
      if (typeof chrome !== "undefined" && chrome.cookies) {
        try {
          const cookie3000 = await chrome.cookies.get({ url: "http://localhost:3000", name: "access_token" });
          const cookie127 = await chrome.cookies.get({ url: "http://127.0.0.1:3000", name: "access_token" });
          let webAppToken = cookie3000?.value || cookie127?.value;

          if (!webAppToken) {
            const allLocalhost = await chrome.cookies.getAll({ domain: "localhost" });
            const tokenCookie = allLocalhost.find((c: any) => c.name === "access_token");
            if (tokenCookie) webAppToken = tokenCookie.value;
          }

          if (webAppToken) {
            await chrome.storage.local.set({ access_token: webAppToken });
            return resolve(webAppToken);
          }
        } catch (e) {
          // Ignore cookie read error
        }
      }

      resolve(null);
    });
  });
}

async function tryRefreshToken(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["refresh_token"], async (res: Record<string, any>) => {
      const refreshToken = res.refresh_token;
      if (!refreshToken) return resolve(null);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const json = await response.json();
        if (response.ok && json.data?.access_token) {
          const newAccess = json.data.access_token;
          const newRefresh = json.data.refresh_token || refreshToken;
          await chrome.storage.local.set({ access_token: newAccess, refresh_token: newRefresh });
          return resolve(newAccess);
        }
      } catch (e) {
        // Ignore refresh failure
      }
      resolve(null);
    });
  });
}

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await getStoredToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    throw new Error("SERVER_UNREACHABLE");
  }

  if (res.status === 401 || res.status === 403) {
    // Attempt automatic token refresh
    const newToken = await tryRefreshToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      try {
        res = await fetch(url, { ...options, headers });
      } catch (err) {
        throw new Error("SERVER_UNREACHABLE");
      }
    }

    if (res.status === 401 || res.status === 403) {
      await chrome.storage.local.remove(["access_token", "refresh_token", "user", "selected_resume_id"]);
      throw new Error("NOT_AUTHENTICATED");
    }
  }

  return res;
}

async function handleVerifyToken() {
  const token = await getStoredToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const res = await authenticatedFetch(`${API_BASE_URL}/users/me`, { method: "GET" });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to verify token.");
  }
  return {
    ...json.data,
    access_token: token,
  };
}

async function handleLogin(credentials: any) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch (err) {
    throw new Error("Cannot connect to ApplyPilot server (localhost:8000). Please check backend.");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.detail || json.message || "Login failed.");
  }

  const token = json.data?.access_token;
  const refreshToken = json.data?.refresh_token;
  if (token) {
    await chrome.storage.local.set({
      access_token: token,
      refresh_token: refreshToken || "",
      user: credentials.email,
    });
  }
  return json.data;
}

async function handleFetchResumes() {
  const res = await authenticatedFetch(`${API_BASE_URL}/resume`, { method: "GET" });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to fetch resumes.");
  }
  return json.data || [];
}

async function handleAnalyzeJob(jobPayload: any) {
  const res = await authenticatedFetch(`${API_BASE_URL}/job/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobPayload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Job analysis failed.");
  }
  return json.data;
}

async function handleGenerateCoverLetter(payload: { resume_id: string; job_description: string }) {
  const res = await authenticatedFetch(`${API_BASE_URL}/cover-letter/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to generate cover letter.");
  }
  return json.data;
}

async function handleGenerateInterviewQuestions(payload: { resume_id: string; job_description: string }) {
  const res = await authenticatedFetch(`${API_BASE_URL}/interview/questions/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to generate interview questions.");
  }
  return json.data;
}

async function handleGenerateResumeImprovement(payload: { resume_id: string; job_description: string }) {
  const res = await authenticatedFetch(`${API_BASE_URL}/resume-improvement/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || json.detail || json.message || "Failed to generate resume optimization.");
  }
  return json.data;
}

async function handleTrackApplication(appPayload: any) {
  const res = await authenticatedFetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(appPayload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.detail || json.message || "Failed to save application.");
  }
  return json.data;
}

async function handleUploadResume(payload: { base64: string; fileName: string; fileType: string }) {
  let token = await getStoredToken();
  if (!token) {
    throw new Error("NOT_AUTHENTICATED");
  }

  let binaryString: string;
  try {
    const cleanBase64 = (payload.base64 || "").replace(/\s/g, "");
    binaryString = atob(cleanBase64);
  } catch (err) {
    throw new Error("Invalid resume file encoding.");
  }

  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: payload.fileType || "application/pdf" });
  const file = new File([blob], payload.fileName || "resume.pdf", { type: payload.fileType || "application/pdf" });

  const formData = new FormData();
  formData.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/resume/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } catch (err) {
    throw new Error("SERVER_UNREACHABLE");
  }

  if (res.status === 401 || res.status === 403) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      token = newToken;
      try {
        res = await fetch(`${API_BASE_URL}/resume/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } catch (err) {
        throw new Error("SERVER_UNREACHABLE");
      }
    }

    if (res.status === 401 || res.status === 403) {
      await chrome.storage.local.remove(["access_token", "refresh_token", "user", "selected_resume_id"]);
      throw new Error("NOT_AUTHENTICATED");
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    let errMsg = "Failed to upload resume.";
    if (typeof json.detail === "string") {
      errMsg = json.detail;
    } else if (typeof json.error?.message === "string") {
      errMsg = json.error.message;
    } else if (typeof json.message === "string") {
      errMsg = json.message;
    } else if (Array.isArray(json.detail) && json.detail[0]?.msg) {
      errMsg = json.detail[0].msg;
    }
    throw new Error(errMsg);
  }
  return json.data;
}


