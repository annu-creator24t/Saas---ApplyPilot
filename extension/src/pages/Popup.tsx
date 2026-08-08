import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import {
  Sparkles,
  Building,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  Loader2,
  Lock,
} from "lucide-react";

export default function Popup() {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Job Data
  const [jobData, setJobData] = useState<any | null>(null);
  const [extracting, setExtracting] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackedSuccess, setTrackedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check auth token
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["access_token", "user"], (res: Record<string, any>) => {
        if (res.access_token) {
          setToken(res.access_token);
          setUserEmail(res.user || "Logged In");
        }
      });
    }

    // 2. Extract job from active tab
    extractActiveTabJob();
  }, []);

  const extractActiveTabJob = () => {
    if (typeof chrome === "undefined" || !chrome.tabs) {
      setExtracting(false);
      return;
    }

    setExtracting(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.id) {
        setExtracting(false);
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: "EXTRACT_JOB" }, (response: any) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          // Fallback script injection if content script not preloaded
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id! },
              func: fallbackExtractor,
            },
            (results: any[]) => {
              if (results && results[0] && results[0].result) {
                setJobData(results[0].result);
              }
              setExtracting(false);
            }
          );
        } else {
          setJobData(response.data);
          setExtracting(false);
        }
      });
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setAuthLoading(true);
    setAuthError(null);

    chrome.runtime.sendMessage(
      {
        action: "LOGIN",
        payload: { email: loginEmail, password: loginPassword },
      },
      (res: any) => {
        setAuthLoading(false);
        if (res && res.success) {
          setToken(res.data.access_token);
          setUserEmail(loginEmail);
        } else {
          setAuthError(res?.error || "Login failed.");
        }
      }
    );
  };

  const handleLogout = () => {
    chrome.storage.local.remove(["access_token", "user"], () => {
      setToken(null);
      setUserEmail(null);
    });
  };

  const handleRunAnalysis = () => {
    if (!jobData || !jobData.job_description) return;
    setAnalyzing(true);
    setError(null);
    setTrackedSuccess(false);

    chrome.runtime.sendMessage(
      {
        action: "ANALYZE_JOB",
        payload: {
          job_title: jobData.job_title,
          company_name: jobData.company_name,
          job_description: jobData.job_description,
          job_url: jobData.job_url,
          location: jobData.location,
        },
      },
      (res: any) => {
        setAnalyzing(false);
        if (res && res.success) {
          setAnalysisResult(res.data);
        } else {
          if (res?.error === "NOT_AUTHENTICATED") {
            setToken(null);
          } else {
            setError(res?.error || "Failed to analyze job.");
          }
        }
      }
    );
  };

  const handleTrackApplication = () => {
    if (!jobData) return;
    setTracking(true);
    setTrackedSuccess(false);

    chrome.runtime.sendMessage(
      {
        action: "TRACK_APPLICATION",
        payload: {
          job_title: jobData.job_title || "Target Role",
          company_name: jobData.company_name || "Company",
          job_description: jobData.job_description,
          job_url: jobData.job_url,
          location: jobData.location,
          status: "APPLIED",
          ats_score: analysisResult?.match_score,
          matched_skills: analysisResult?.matched_skills || [],
          missing_skills: analysisResult?.missing_skills || [],
        },
      },
      (res: any) => {
        setTracking(false);
        if (res && res.success) {
          setTrackedSuccess(true);
        } else {
          setError(res?.error || "Failed to track application.");
        }
      }
    );
  };

  return (
    <div className="w-[360px] min-h-[480px] bg-slate-950 text-slate-100 p-4 font-sans flex flex-col justify-between">
      <div>
        <Header userEmail={userEmail} onLogout={handleLogout} />

        {/* Login Screen if Unauthenticated */}
        {!token ? (
          <div className="space-y-4 pt-2">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-bold text-white">Log in to ApplyPilot</h2>
              <p className="text-[11px] text-slate-400">
                Connect your account to analyze job postings and track applications directly.
              </p>
            </div>

            {authError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] text-rose-400 text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition flex items-center justify-center gap-2"
              >
                {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In to Extension"}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Detected Job Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-xs text-white leading-snug">
                    {extracting
                      ? "Detecting Job Page..."
                      : jobData?.job_title || "Job Page Detected"}
                  </h2>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="h-3 w-3 text-slate-500" />{" "}
                    {jobData?.company_name || "Unknown Company"}
                  </p>
                </div>
                {jobData?.source_site && (
                  <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                    {jobData.source_site}
                  </span>
                )}
              </div>

              {jobData?.location && (
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-500" /> {jobData.location}
                </p>
              )}
            </div>

            {/* AI Analysis Card */}
            {analysisResult ? (
              <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-300">ATS Match Score</span>
                  <span className="text-lg font-extrabold text-indigo-400">
                    {analysisResult.match_score}%
                  </span>
                </div>

                {/* Skills Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Matched Skills:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysisResult.matched_skills?.slice(0, 4).map((s: string, i: number) => (
                        <span
                          key={i}
                          className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Missing Skills:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {analysisResult.missing_skills?.slice(0, 4).map((s: string, i: number) => (
                        <span
                          key={i}
                          className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300 border border-amber-500/20"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing || !jobData}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition flex items-center justify-center gap-2"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                <span>{analyzing ? "Analyzing Job Fit..." : "Analyze Job with AI"}</span>
              </button>
            )}

            {error && (
              <p className="text-[11px] text-rose-400 text-center font-medium">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Track Application Action */}
      {token && (
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={handleTrackApplication}
            disabled={tracking || trackedSuccess}
            className={`w-full rounded-xl py-2.5 text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 ${
              trackedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            {tracking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : trackedSuccess ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{trackedSuccess ? "Saved to Dashboard!" : "1-Click Track Application"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Fallback script function for executeScript
function fallbackExtractor() {
  const h1 = document.querySelector("h1");
  const job_title = h1 ? h1.innerText.trim() : document.title;
  const mainEl = document.querySelector("main") || document.body;
  const job_description = mainEl ? mainEl.innerText.slice(0, 3000).trim() : "";

  return {
    job_title,
    company_name: window.location.hostname.replace("www.", "").split(".")[0],
    job_url: window.location.href,
    job_description,
    source_site: "General",
  };
}