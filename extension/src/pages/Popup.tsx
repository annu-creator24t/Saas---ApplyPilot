import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import { FRONTEND_URL } from "../config";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  Upload,
  AlertTriangle,
} from "lucide-react";

interface ResumeItem {
  id?: string;
  _id?: string;
  resume_id?: string;
  title?: string;
  original_filename?: string;
  file_name?: string;
  created_at?: string;
  is_default?: boolean;
}

interface JobData {
  job_title?: string;
  company_name?: string;
  location?: string;
  job_description?: string;
  job_url?: string;
  source_site?: string;
  detected?: boolean;
}

interface AnalysisResult {
  match_score: number;
  job_title?: string;
  company_name?: string;
  location?: string;
}

export default function Popup() {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [resumes, setResumes] =
    useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] =
    useState("");
  const [loadingResumes, setLoadingResumes] =
    useState(false);
  const [uploadingResume, setUploadingResume] =
    useState(false);
  const [showResumePicker, setShowResumePicker] =
    useState(false);

  const [jobData, setJobData] =
    useState<JobData | null>(null);
  const [extracting, setExtracting] =
    useState(true);

  const [analysisResult, setAnalysisResult] =
    useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);
  const [analysisAttempted, setAnalysisAttempted] =
    useState(false);

  const currentJD =
    jobData?.job_description?.trim() || "";

  const currentTitle =
    jobData?.job_title?.trim() ||
    "Job Posting";

  const currentCompany =
    jobData?.company_name?.trim() ||
    "Company";

  const isDetected = Boolean(
    jobData?.detected === true &&
      jobData?.job_title &&
      jobData.job_title.trim().length > 0 &&
      jobData?.job_description &&
      jobData.job_description.trim().length >= 30
  );

  // =========================================================
  // INITIALIZATION
  // =========================================================

  useEffect(() => {
    loadPendingJob();
    verifySession();
  }, []);

  // =========================================================
  // AUTOMATIC MATCH SCORE
  // =========================================================

  useEffect(() => {
    if (
      !token ||
      !isDetected ||
      currentJD.length < 30 ||
      extracting ||
      analyzing ||
      analysisResult ||
      error ||
      analysisAttempted
    ) {
      return;
    }

    executeAnalysis();
  }, [
    token,
    isDetected,
    currentJD,
    extracting,
    analyzing,
    analysisResult,
    error,
    analysisAttempted,
  ]);

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const verifySession = () => {
    chrome.runtime.sendMessage(
      {
        action: "VERIFY_TOKEN",
      },
      (response: any) => {
        const runtimeError =
          chrome.runtime.lastError;

        if (runtimeError) {
          setError(runtimeError.message || "Failed to verify session.");
          return;
        }

        if (
          response?.success &&
          response.data?.access_token
        ) {
          const activeToken =
            response.data.access_token;

          setToken(activeToken);

          setUserEmail(
            response.data?.email ||
              response.data?.user?.email ||
              "Logged In"
          );

          chrome.storage.local.set({
            access_token: activeToken,
            user:
              response.data?.email ||
              response.data?.user?.email ||
              "Logged In",
          });

          return;
        }

        if (
          response?.error ===
          "SERVER_UNREACHABLE"
        ) {
          setError(
            "Cannot connect to ApplyPilot server. Please make sure the backend is running."
          );
          return;
        }

        setToken(null);
        setUserEmail(null);
      }
    );
  };

  const handleLoginSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (
      !loginEmail.trim() ||
      !loginPassword.trim()
    ) {
      setAuthError(
        "Please enter your email and password."
      );
      return;
    }

    setAuthLoading(true);
    setAuthError(null);
    setError(null);

    chrome.runtime.sendMessage(
      {
        action: "LOGIN",
        payload: {
          email: loginEmail.trim(),
          password: loginPassword,
        },
      },
      (response: any) => {
        setAuthLoading(false);

        const runtimeError =
          chrome.runtime.lastError;

        if (runtimeError) {
          setAuthError(
            runtimeError.message || "Login failed."
          );
          return;
        }

        if (
          response?.success &&
          response.data?.access_token
        ) {
          const activeToken =
            response.data.access_token;

          setToken(activeToken);
          setUserEmail(loginEmail.trim());

          chrome.storage.local.set({
            access_token: activeToken,
            refresh_token:
              response.data.refresh_token ||
              "",
            user: loginEmail.trim(),
          });

          return;
        }

        setAuthError(
          response?.error ||
            "Login failed. Please check your credentials."
        );
      }
    );
  };

  const handleLogout = () => {
    chrome.storage.local.remove(
      [
        "access_token",
        "refresh_token",
        "user",
        "selected_resume_id",
      ],
      () => {
        setToken(null);
        setUserEmail(null);
        setResumes([]);
        setSelectedResumeId("");
        setAnalysisResult(null);
      }
    );
  };

  // =========================================================
  // JOB EXTRACTION
  // =========================================================

  const loadPendingJob = () => {
    chrome.storage.local.get(
      ["pending_extracted_job"],
      (result: Record<string, any>) => {
        const pending =
          result.pending_extracted_job;

        if (
          pending?.job_description
        ) {
          setJobData(pending);
          setExtracting(false);
          return;
        }

        extractActiveTabJob();
      }
    );
  };

  const extractActiveTabJob = () => {
    setExtracting(true);
    setError(null);

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs: chrome.tabs.Tab[]) => {
        const activeTab = tabs[0];

        if (!activeTab?.id) {
          setExtracting(false);
          return;
        }

        chrome.tabs.sendMessage(
          activeTab.id,
          {
            action: "EXTRACT_JOB",
          },
          (response: any) => {
            const runtimeError =
              chrome.runtime.lastError;

            if (
              !runtimeError &&
              response?.success &&
              response?.data
            ) {
              saveDetectedJob(
                response.data
              );
              setExtracting(false);
              return;
            }

            // Fallback extraction
            if (
              chrome.scripting &&
              activeTab.id
            ) {
              chrome.scripting.executeScript(
                {
                  target: {
                    tabId: activeTab.id,
                  },
                  func: fallbackDOMExtractor,
                },
                (results: any[]) => {
                  const scriptError =
                    chrome.runtime.lastError;

                  if (
                    !scriptError &&
                    results?.[0]?.result
                  ) {
                    saveDetectedJob(
                      results[0].result
                    );
                  }

                  setExtracting(false);
                }
              );

              return;
            }

            setExtracting(false);
          }
        );
      }
    );
  };

  const saveDetectedJob = (
    job: JobData
  ) => {
    setJobData(job);
    setAnalysisAttempted(false);
    setError(null);
    setAnalysisResult(null);

    if (job?.detected && job?.job_description) {
      chrome.storage.local.set({
        pending_extracted_job: job,
      });
    } else {
      chrome.storage.local.remove(["pending_extracted_job"]);
    }
  };

  // =========================================================
  // RESUME MANAGEMENT
  // =========================================================

  const getResumeId = (
    resume: ResumeItem
  ) =>
    resume.resume_id ||
    resume.id ||
    resume._id ||
    "";

  const fetchResumes = () => {
    setLoadingResumes(true);

    chrome.runtime.sendMessage(
      {
        action: "FETCH_RESUMES",
      },
      (response: any) => {
        setLoadingResumes(false);

        const runtimeError =
          chrome.runtime.lastError;

        if (runtimeError) {
          setError(
            runtimeError.message || "Failed to fetch resumes."
          );
          return;
        }

        if (
          response?.success &&
          Array.isArray(response.data)
        ) {
          const serverResumes =
            response.data as ResumeItem[];

          setResumes(serverResumes);

          chrome.storage.local.get(
            ["selected_resume_id"],
            (stored: Record<string, any>) => {
              const storedId =
                stored.selected_resume_id;

              const storedResume =
                serverResumes.find(
                  (resume) =>
                    getResumeId(resume) ===
                    storedId
                );

              const defaultResume =
                serverResumes.find(
                  (resume) =>
                    resume.is_default === true
                );

              const resumeToUse =
                storedResume ||
                defaultResume ||
                serverResumes[0];

              if (resumeToUse) {
                const resumeId =
                  getResumeId(
                    resumeToUse
                  );

                setSelectedResumeId(
                  resumeId
                );

                chrome.storage.local.set({
                  selected_resume_id:
                    resumeId,
                });
              }
            }
          );

          return;
        }

        if (
          response?.error ===
          "NOT_AUTHENTICATED"
        ) {
          handleLogout();

          setAuthError(
            "Session expired. Please log in again."
          );

          return;
        }

        setError(
          response?.error ||
            "Unable to load your resumes."
        );
      }
    );
  };

  const handleSelectResume = (
    resumeId: string
  ) => {
    setSelectedResumeId(resumeId);

    chrome.storage.local.set({
      selected_resume_id: resumeId,
    });

    setAnalysisResult(null);
    setError(null);
    setAnalysisAttempted(false);

    setShowResumePicker(false);

    // Re-run analysis with explicitly selected resume.
    if (
      token &&
      currentJD.length >= 30
    ) {
      setTimeout(() => {
        executeAnalysis(resumeId);
      }, 0);
    }
  };

  const handleUploadResume = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const extension =
      file.name
        .substring(
          file.name.lastIndexOf(".")
        )
        .toLowerCase();

    if (
      ![".pdf", ".docx"].includes(
        extension
      )
    ) {
      setError(
        "Only PDF and DOCX resumes are supported."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Resume file must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setUploadingResume(true);
    setError(null);

    const reader =
      new FileReader();

    reader.onload = () => {
      const result =
        reader.result as string;

      const base64 =
        result.split(",")[1] ||
        result;

      chrome.runtime.sendMessage(
        {
          action: "UPLOAD_RESUME",
          payload: {
            base64,
            fileName: file.name,
            fileType:
              file.type ||
              "application/pdf",
          },
        },
        (response: any) => {
          setUploadingResume(false);

          event.target.value = "";

          const runtimeError =
            chrome.runtime.lastError;

          if (runtimeError) {
            setError(
              runtimeError.message || "Failed to upload resume."
            );
            return;
          }

          if (
            response?.success &&
            response.data
          ) {
            const uploaded =
              response.data as ResumeItem;

            const uploadedId =
              getResumeId(uploaded);

            setResumes((previous) => [
              uploaded,
              ...previous,
            ]);

            if (uploadedId) {
              setSelectedResumeId(
                uploadedId
              );

              chrome.storage.local.set({
                selected_resume_id:
                  uploadedId,
              });
            }

            setShowResumePicker(false);
            setAnalysisResult(null);
            setAnalysisAttempted(false);

            // Analyze against the newly selected resume.
            if (
              token &&
              currentJD.length >= 30
            ) {
              setTimeout(() => {
                executeAnalysis(
                  uploadedId
                );
              }, 0);
            }

            return;
          }

          if (
            response?.error ===
            "NOT_AUTHENTICATED"
          ) {
            handleLogout();

            setAuthError(
              "Session expired. Please log in again."
            );

            return;
          }

          setError(
            response?.error ||
              "Failed to upload resume."
          );
        }
      );
    };

    reader.onerror = () => {
      setUploadingResume(false);

      event.target.value = "";

      setError(
        "Failed to read the selected resume."
      );
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // JOB MATCH ANALYSIS
  // =========================================================

  const executeAnalysis = (
    explicitResumeId?: string
  ) => {
    if (
      !currentJD ||
      currentJD.trim().length < 30
    ) {
      setError(
        "The detected job description is too short to analyze."
      );
      return;
    }

    if (analyzing) {
      return;
    }

    setAnalysisAttempted(true);
    setAnalyzing(true);
    setError(null);

    const payload: Record<
      string,
      any
    > = {
      job_title:
        currentTitle,
      company_name:
        currentCompany,
      job_description:
        currentJD,
      job_url:
        jobData?.job_url ||
        "",
      location:
        jobData?.location ||
        "",
    };

    /*
     * IMPORTANT:
     *
     * Normal analysis does NOT require a resume_id.
     *
     * The backend identifies the authenticated user
     * and selects the user's saved/default resume.
     *
     * We only send resume_id when the user explicitly
     * chooses a different resume.
     */
    const resumeId =
      explicitResumeId ||
      selectedResumeId;

    if (resumeId) {
      payload.resume_id =
        resumeId;
    }

    chrome.runtime.sendMessage(
      {
        action: "ANALYZE_JOB",
        payload,
      },
      (response: any) => {
        setAnalyzing(false);

        const runtimeError =
          chrome.runtime.lastError;

        if (runtimeError) {
          setError(
            runtimeError.message || "Failed to analyze job."
          );
          return;
        }

        if (
          response?.success &&
          response.data
        ) {
          setAnalysisResult({
            match_score:
              Number(
                response.data
                  .match_score
              ),
            job_title:
              response.data
                .job_title ||
              currentTitle,
            company_name:
              response.data
                .company_name ||
              currentCompany,
            location:
              response.data
                .location ||
              jobData?.location ||
              "",
          });

          return;
        }

        if (
          response?.error ===
          "NOT_AUTHENTICATED"
        ) {
          handleLogout();

          setAuthError(
            "Session expired. Please log in again."
          );

          return;
        }

        setError(
          response?.error ||
            "Unable to calculate match score."
        );
      }
    );
  };

  // =========================================================
  // WEBSITE REDIRECT
  // =========================================================

  const openFullAnalysis = () => {
    if (!jobData?.job_description) {
      return;
    }

    const pendingAnalysis = {
      job_title:
        currentTitle,
      company_name:
        currentCompany,
      location:
        jobData.location ||
        "",
      job_description:
        currentJD,
      job_url:
        jobData.job_url ||
        "",
      source_site:
        jobData.source_site ||
        "",
      resume_id:
        selectedResumeId ||
        null,
    };

    chrome.storage.local.set(
      {
        applypilot_pending_analysis:
          pendingAnalysis,
      },
      () => {
        const params =
          new URLSearchParams({
            source:
              "extension",
            job_url:
              jobData.job_url ||
              "",
          });

        chrome.tabs.create({
          url:
            `${FRONTEND_URL}/dashboard/resume-optimizer?${params.toString()}`,
        });
      }
    );
  };

  // =========================================================
  // LOGIN VIEW
  // =========================================================

  if (!token) {
    return (
      <div className="w-[380px] min-h-[420px] bg-slate-950 text-slate-100 p-4 font-sans">
        <Header
          userEmail={null}
        />

        <div className="space-y-4 pt-3">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Lock className="h-5 w-5" />
            </div>

            <h2 className="text-sm font-bold text-white">
              Log in to ApplyPilot
            </h2>

            <p className="text-[11px] text-slate-400">
              Sign in once to calculate
              job match scores using
              your saved resume.
            </p>
          </div>

          {authError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] text-rose-400 text-center">
              {authError}
            </div>
          )}

          <form
            onSubmit={
              handleLoginSubmit
            }
            className="space-y-3"
          >
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Email
              </label>

              <input
                type="email"
                required
                value={loginEmail}
                onChange={(event) =>
                  setLoginEmail(
                    event.target.value
                  )
                }
                placeholder="your@email.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Password
              </label>

              <input
                type="password"
                required
                value={loginPassword}
                onChange={(event) =>
                  setLoginPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={
                authLoading
              }
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In to Extension"
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center space-y-1.5">
            <a
              href={`${FRONTEND_URL}/register`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              Create Account on Website
              <ExternalLink className="h-2.5 w-2.5" />
            </a>

            <br />

            <a
              href={`${FRONTEND_URL}/login`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-slate-500 hover:text-slate-300 inline-flex items-center gap-1"
            >
              Log in on Web App
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN EXTENSION VIEW
  // =========================================================

  return (
    <div className="w-[380px] min-h-[360px] bg-slate-950 text-slate-100 p-4 font-sans">
      <Header
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={
          handleUploadResume
        }
      />

      <div className="space-y-3">
        {/* JOB DETECTION */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
          {extracting ? (
            <div className="flex items-center justify-center gap-2 py-5">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />

              <span className="text-xs text-slate-300">
                Detecting job...
              </span>
            </div>
          ) : isDetected ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />

                <span className="text-[11px] font-semibold text-emerald-400">
                  Job detected
                </span>
              </div>

              <p className="text-sm font-bold text-white truncate">
                {currentTitle}
              </p>

              <p className="text-[11px] text-slate-400 truncate">
                {currentCompany}

                {jobData?.location
                  ? ` • ${jobData.location}`
                  : ""}
              </p>
            </div>
          ) : (
            <div className="text-center py-5 space-y-2">
              <AlertTriangle className="h-5 w-5 text-amber-400 mx-auto" />

              <p className="text-xs text-slate-300">
                Job description could
                not be detected on this
                page.
              </p>

              <button
                onClick={
                  extractActiveTabJob
                }
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* ANALYZING */}
        {analyzing && (
          <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-6 text-center">
            <Loader2 className="h-7 w-7 animate-spin mx-auto text-indigo-400" />

            <p className="mt-3 text-xs font-semibold text-white">
              Calculating Match Score
            </p>

            <p className="mt-1 text-[10px] text-slate-500">
              Comparing this job with
              your saved resume.
            </p>
          </div>
        )}

        {/* SCORE ONLY */}
        {!analyzing &&
          analysisResult && (
            <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
                Match Score
              </p>

              <p className="mt-1 text-6xl font-black text-indigo-400 leading-none">
                {
                  analysisResult.match_score
                }%
              </p>

              <p className="mt-2 text-[10px] text-slate-500">
                Based on your saved
                ApplyPilot resume
              </p>

              <button
                onClick={
                  openFullAnalysis
                }
                className="mt-5 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition flex items-center justify-center gap-2"
              >
                View Full Analysis
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

        {/* OPTIONAL RESUME CHANGE */}
        {!analyzing && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5">
            <button
              type="button"
              onClick={() => {
                if (
                  !resumes.length
                ) {
                  fetchResumes();
                }

                setShowResumePicker(
                  (previous) =>
                    !previous
                );
              }}
              className="w-full flex items-center justify-center gap-1.5 text-[10px] text-slate-400 hover:text-indigo-400 transition"
            >
              <FileText className="h-3 w-3" />
              Change Resume
            </button>

            {showResumePicker && (
              <div className="mt-2 space-y-2">
                {loadingResumes ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  </div>
                ) : (
                  <>
                    {resumes.length > 0 && (
                      <select
                        value={
                          selectedResumeId
                        }
                        onChange={(event) =>
                          handleSelectResume(
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-[11px] text-white focus:border-indigo-500 focus:outline-none"
                      >
                        {resumes.map(
                          (resume) => {
                            const id =
                              getResumeId(
                                resume
                              );

                            return (
                              <option
                                key={id}
                                value={id}
                              >
                                {resume.title ||
                                  resume.original_filename ||
                                  resume.file_name ||
                                  "Resume"}

                                {resume.is_default
                                  ? " (Default)"
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={
                        uploadingResume
                      }
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 text-[10px] text-slate-300 hover:bg-slate-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {uploadingResume ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}

                      {uploadingResume
                        ? "Uploading..."
                        : "Upload New Resume"}
                    </button>
                  </>
                )}

                {!loadingResumes &&
                  resumes.length === 0 && (
                    <p className="text-center text-[10px] text-slate-500">
                      No saved resumes found.
                    </p>
                  )}
              </div>
            )}
          </div>
        )}

        {/* ERROR & NO RESUME HELPER */}
        {error && (
          error.toLowerCase().includes("resume") ? (
            <div className="rounded-xl border border-indigo-500/30 bg-slate-900/90 p-4 text-center space-y-3">
              <div className="mx-auto w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-white">No Resume Found</p>
                <p className="text-[10px] text-slate-400">
                  Please upload your resume to calculate ATS match scores and AI suggestions.
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                  className="flex-1 rounded-lg bg-indigo-600 py-2 text-[11px] font-semibold text-white hover:bg-indigo-500 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {uploadingResume ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  {uploadingResume ? "Uploading..." : "Upload Resume"}
                </button>
                <a
                  href={`${FRONTEND_URL}/dashboard`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition flex items-center justify-center gap-1"
                >
                  Dashboard <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-center">
              <p className="text-[10px] text-rose-400">
                {error}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

// =========================================================
// FALLBACK DOM EXTRACTOR
// =========================================================

function fallbackDOMExtractor() {
  const url = window.location.href;
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  let job_title = "";
  let company_name = "";
  let location = "";
  let job_description = "";

  if (hostname.includes("linkedin.com")) {
    const isJobDetailsPage =
      pathname.includes("/jobs/view") ||
      pathname.includes("/jobs/search") ||
      url.includes("currentJobId=");

    if (isJobDetailsPage) {
      const titleEl = document.querySelector(
        ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, .jobs-search__job-details--container h2, h1.t-24, .top-card-layout__title"
      );
      const companyEl = document.querySelector(
        ".job-details-jobs-unified-top-card__company-name a, .jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .topcard__org-name-link"
      );
      const locEl = document.querySelector(
        ".job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .topcard__flavor--bullet"
      );
      const descEl = document.querySelector(
        "#job-details, .jobs-description__content, .jobs-description-content__text, .jobs-description__container, article.jobs-description__container"
      );

      job_title = (titleEl as HTMLElement)?.innerText?.trim() || "";
      company_name = (companyEl as HTMLElement)?.innerText?.trim() || "";
      location = (locEl as HTMLElement)?.innerText?.trim() || "";
      job_description = (descEl as HTMLElement)?.innerText?.trim() || "";
    } else {
      // Feed or direct update post: check active modal or visible post
      const modal = document.querySelector<HTMLElement>(".artdeco-modal[role='dialog'], div.feed-shared-update-v2__modal");
      const targetPost = modal || document.querySelector<HTMLElement>(".feed-shared-update-v2, div[data-urn*='activity']");
      if (targetPost) {
        const text = (targetPost.innerText || "").trim();
        const roleMatch = text.match(/(?:Role|Position|Job Title|Profile|Designation)\s*[:\-–—]\s*([^\n\r,•!|–—]{3,50})/i);
        const compMatch = text.match(/(?:Company|Employer|Organization)\s*[:\-–—]\s*([^\n\r,•!|–—]{2,40})/i) ||
                          text.match(/([A-Z][A-Za-z0-9\s&]{1,30})\s+(?:is|are)\s+hiring/i);
        const locMatch = text.match(/(?:Location|Loc|Workplace|City)\s*[:\-–—]\s*([^\n\r•!|–—]{2,50})/i);

        if (roleMatch && roleMatch[1]) job_title = roleMatch[1].trim();
        if (compMatch && compMatch[1] && !/^(we|they|team)$/i.test(compMatch[1])) company_name = compMatch[1].trim();
        if (locMatch && locMatch[1]) location = locMatch[1].trim();

        if (job_title && (company_name || location)) {
          job_description = text;
        }
      }
    }
  } else {
    // Try standard job selectors
    const titleEl = document.querySelector("h1.title, h1.jobsearch-JobInfoHeader-title, .app-title, .posting-header h2, [data-automation-id='jobTitle']");
    if (titleEl) {
      job_title = (titleEl as HTMLElement).innerText?.trim() || "";
    }
    const descEl = document.querySelector("#jobDescriptionText, #job-details, #content, [data-automation-id='jobDetails'], section.job-desc");
    if (descEl) {
      job_description = (descEl as HTMLElement).innerText?.trim() || "";
    }
  }

  // Validate non-generic fields
  const invalidTitles = /^(Feed|Home|LinkedIn|Notifications|Post|Update|Careers|Jobs|Hiring|Opportunity|Details|Job|Dashboard|Messaging|Inbox|Sign In|Login|ApplyPilot)$/i;
  const isInvalid = !job_title || invalidTitles.test(job_title) || !job_description || job_description.length < 30;

  return {
    job_title: isInvalid ? "" : job_title,
    company_name: isInvalid ? "" : (company_name || "Company"),
    location: isInvalid ? "" : location,
    job_description: isInvalid ? "" : job_description,
    job_url: window.location.href,
    source_site: hostname,
    detected: !isInvalid,
  };
}