import { API_BASE_URL } from "../config";

console.log(
  `[ApplyPilot Background Worker] Initialized. Target API: ${API_BASE_URL}`
);

// =========================================================
// MESSAGE ROUTER
// =========================================================

chrome.runtime.onMessage.addListener(
  (
    message: {
      action: string;
      payload?: any;
    },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) => {
    if (message.action === "VERIFY_TOKEN") {
      handleVerifyToken()
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    if (message.action === "LOGIN") {
      handleLogin(message.payload)
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    if (message.action === "FETCH_RESUMES") {
      handleFetchResumes()
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    if (message.action === "ANALYZE_JOB") {
      handleAnalyzeJob(message.payload)
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    /*
     * These actions are kept for compatibility with
     * the existing extension/backend architecture.
     *
     * The new Popup does not call these during the
     * normal match-score flow.
     */

    if (
      message.action ===
      "GENERATE_COVER_LETTER"
    ) {
      handleGenerateCoverLetter(
        message.payload
      )
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    if (
      message.action ===
      "GENERATE_INTERVIEW_QUESTIONS"
    ) {
      handleGenerateInterviewQuestions(
        message.payload
      )
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    if (
      message.action ===
      "GENERATE_RESUME_IMPROVEMENT"
    ) {
      handleGenerateResumeImprovement(
        message.payload
      )
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    if (
      message.action ===
      "TRACK_APPLICATION"
    ) {
      handleTrackApplication(
        message.payload
      )
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    /*
     * Resume upload remains available only when the
     * user explicitly selects "Upload New Resume".
     *
     * It is NOT part of the normal match-score flow.
     */

    if (
      message.action ===
      "UPLOAD_RESUME"
    ) {
      handleUploadResume(
        message.payload
      )
        .then((res) =>
          sendResponse({
            success: true,
            data: res,
          })
        )
        .catch((err) =>
          sendResponse({
            success: false,
            error:
              err instanceof Error
                ? err.message
                : String(err),
          })
        );

      return true;
    }

    return false;
  }
);

// =========================================================
// TOKEN
// =========================================================

async function getStoredToken(): Promise<
  string | null
> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["access_token"],
      async (
        result: Record<string, any>
      ) => {
        if (result.access_token) {
          resolve(
            result.access_token
          );
          return;
        }

        resolve(null);
      }
    );
  });
}

// =========================================================
// REFRESH TOKEN
// =========================================================

async function tryRefreshToken(): Promise<
  string | null
> {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      ["refresh_token"],
      async (
        result: Record<string, any>
      ) => {
        const refreshToken =
          result.refresh_token;

        if (!refreshToken) {
          resolve(null);
          return;
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/auth/refresh`,
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  refresh_token:
                    refreshToken,
                }),
              }
            );

          const json =
            await response.json();

          if (
            response.ok &&
            json.data?.access_token
          ) {
            const newAccessToken =
              json.data
                .access_token;

            const newRefreshToken =
              json.data
                .refresh_token ||
              refreshToken;

            await chrome.storage.local.set(
              {
                access_token:
                  newAccessToken,
                refresh_token:
                  newRefreshToken,
              }
            );

            resolve(
              newAccessToken
            );

            return;
          }
        } catch {
          // Ignore refresh failure.
        }

        resolve(null);
      }
    );
  });
}

// =========================================================
// AUTHENTICATED FETCH
// =========================================================

async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token =
    await getStoredToken();

  if (!token) {
    throw new Error(
      "NOT_AUTHENTICATED"
    );
  }

  const headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  let response: Response;

  try {
    response = await fetch(
      url,
      {
        ...options,
        headers,
      }
    );
  } catch (err: any) {
    const detail =
      err instanceof Error
        ? err.message
        : String(err);

    throw new Error(
      `SERVER_UNREACHABLE (${url}): ${detail}`
    );
  }

  /*
   * If the access token expired,
   * attempt one refresh and retry.
   */
  if (
    response.status === 401 ||
    response.status === 403
  ) {
    const refreshedToken =
      await tryRefreshToken();

    if (refreshedToken) {
      headers.set(
        "Authorization",
        `Bearer ${refreshedToken}`
      );

      try {
        response =
          await fetch(
            url,
            {
              ...options,
              headers,
            }
          );
      } catch (err: any) {
        const detail =
          err instanceof Error
            ? err.message
            : String(err);

        throw new Error(
          `SERVER_UNREACHABLE (${url}): ${detail}`
        );
      }
    }

    /*
     * Still unauthorized after refresh.
     */
    if (
      response.status === 401 ||
      response.status === 403
    ) {
      await chrome.storage.local.remove(
        [
          "access_token",
          "refresh_token",
          "user",
          "selected_resume_id",
        ]
      );

      throw new Error(
        "NOT_AUTHENTICATED"
      );
    }
  }

  return response;
}

// =========================================================
// VERIFY TOKEN
// =========================================================

async function handleVerifyToken() {
  const token =
    await getStoredToken();

  if (!token) {
    throw new Error(
      "NOT_AUTHENTICATED"
    );
  }

  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/users/me`,
      {
        method: "GET",
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to verify token."
    );
  }

  /*
   * Preserve the access token in the
   * response because Popup.tsx uses it
   * to establish its authenticated state.
   */
  return {
    ...(json.data || {}),
    access_token: token,
  };
}

// =========================================================
// LOGIN
// =========================================================

async function handleLogin(
  credentials: {
    email: string;
    password: string;
  }
) {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          credentials
        ),
      }
    );
  } catch (err: any) {
    const detail =
      err instanceof Error
        ? err.message
        : String(err);

    console.error(
      `[ApplyPilot Background Worker] Failed to connect to ${API_BASE_URL}/auth/login:`,
      detail
    );

    throw new Error(
      `SERVER_UNREACHABLE (${API_BASE_URL}): ${detail}`
    );
  }

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Login failed."
    );
  }

  const data =
    json.data || json;

  const accessToken =
    data.access_token;

  const refreshToken =
    data.refresh_token;

  if (accessToken) {
    await chrome.storage.local.set(
      {
        access_token:
          accessToken,
        refresh_token:
          refreshToken || "",
        user:
          credentials.email,
      }
    );
  }

  return data;
}

// =========================================================
// FETCH RESUMES
// =========================================================

async function handleFetchResumes() {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/resume`,
      {
        method: "GET",
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to fetch resumes."
    );
  }

  /*
   * Backend APIResponse:
   *
   * {
   *   success: true,
   *   message: "...",
   *   data: [...]
   * }
   */
  return json.data || [];
}

// =========================================================
// JOB MATCH ANALYSIS
// =========================================================

async function handleAnalyzeJob(
  jobPayload: any
) {
  if (
    !jobPayload ||
    !jobPayload.job_description
  ) {
    throw new Error(
      "No job description was provided."
    );
  }

  const jobDescription =
    String(
      jobPayload.job_description
    ).trim();

  if (
    jobDescription.length < 10
  ) {
    throw new Error(
      "Job description is too short to analyze."
    );
  }

  /*
   * IMPORTANT:
   *
   * The extension does NOT upload or download
   * the user's resume during normal analysis.
   *
   * The backend identifies the authenticated
   * user through the JWT and selects:
   *
   * 1. Explicit resume_id, if user selected one.
   * 2. Otherwise default resume.
   * 3. Otherwise latest saved resume.
   */

  const payload: Record<
    string,
    any
  > = {
    job_title:
      jobPayload.job_title ||
      "",
    company_name:
      jobPayload.company_name ||
      "",
    job_description:
      jobDescription,
    job_url:
      jobPayload.job_url ||
      "",
    location:
      jobPayload.location ||
      "",
  };

  /*
   * Only include resume_id when it exists.
   *
   * If undefined, backend handles resume
   * selection automatically.
   */
  if (
    jobPayload.resume_id
  ) {
    payload.resume_id =
      jobPayload.resume_id;
  }

  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/job/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Job analysis failed."
    );
  }

  return json.data;
}

// =========================================================
// OPTIONAL RESUME UPLOAD
// =========================================================

async function handleUploadResume(
  payload: {
    base64: string;
    fileName: string;
    fileType: string;
  }
) {
  if (
    !payload ||
    !payload.base64
  ) {
    throw new Error(
      "No resume file was provided."
    );
  }

  let token =
    await getStoredToken();

  if (!token) {
    throw new Error(
      "NOT_AUTHENTICATED"
    );
  }

  /*
   * Convert Base64 to binary.
   */
  let binaryString: string;

  try {
    binaryString =
      atob(
        payload.base64
          .replace(/\s/g, "")
      );
  } catch {
    throw new Error(
      "Invalid resume file encoding."
    );
  }

  const bytes =
    new Uint8Array(
      binaryString.length
    );

  for (
    let index = 0;
    index < binaryString.length;
    index++
  ) {
    bytes[index] =
      binaryString.charCodeAt(
        index
      );
  }

  const blob =
    new Blob(
      [bytes],
      {
        type:
          payload.fileType ||
          "application/pdf",
      }
    );

  const file =
    new File(
      [blob],
      payload.fileName ||
        "resume.pdf",
      {
        type:
          payload.fileType ||
          "application/pdf",
      }
    );

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  let response: Response;

  try {
    response =
      await fetch(
        `${API_BASE_URL}/resume/upload`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: formData,
        }
      );
  } catch {
    throw new Error(
      "SERVER_UNREACHABLE"
    );
  }

  /*
   * Retry upload once after token refresh.
   */
  if (
    response.status === 401 ||
    response.status === 403
  ) {
    const refreshedToken =
      await tryRefreshToken();

    if (refreshedToken) {
      token =
        refreshedToken;

      response =
        await fetch(
          `${API_BASE_URL}/resume/upload`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          }
        );
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      await chrome.storage.local.remove(
        [
          "access_token",
          "refresh_token",
          "user",
          "selected_resume_id",
        ]
      );

      throw new Error(
        "NOT_AUTHENTICATED"
      );
    }
  }

  const json =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to upload resume."
    );
  }

  return json.data;
}

// =========================================================
// OPTIONAL WEBSITE FEATURES
// =========================================================
// These handlers remain compatible with the existing
// extension architecture. The new Popup does not expose
// these as extension UI; detailed functionality is handled
// by the ApplyPilot web application.

// ---------------------------------------------------------
// Cover Letter
// ---------------------------------------------------------

async function handleGenerateCoverLetter(
  payload: any
) {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/cover-letter/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to generate cover letter."
    );
  }

  return json.data;
}

// ---------------------------------------------------------
// Interview Questions
// ---------------------------------------------------------

async function handleGenerateInterviewQuestions(
  payload: any
) {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/interview/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to generate interview questions."
    );
  }

  return json.data;
}

// ---------------------------------------------------------
// Resume Improvement
// ---------------------------------------------------------

async function handleGenerateResumeImprovement(
  payload: any
) {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/resume/improve`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to improve resume."
    );
  }

  return json.data;
}

// ---------------------------------------------------------
// Application Tracking
// ---------------------------------------------------------

async function handleTrackApplication(
  payload: any
) {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/applications`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          payload
        ),
      }
    );

  const json =
    await response.json();

  if (!response.ok) {
    throw new Error(
      json.detail ||
        json.message ||
        json.error?.message ||
        "Failed to track application."
    );
  }

  return json.data;
}