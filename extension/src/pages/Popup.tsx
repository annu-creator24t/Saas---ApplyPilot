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
  FileText,
  ExternalLink,
  AlertTriangle,
  Edit3,
  Copy,
  Check,
  Wand2,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

interface ResumeItem {
  id?: string;
  _id?: string;
  resume_id?: string;
  title: string;
  original_filename?: string;
  file_name?: string;
  created_at?: string;
}

export default function Popup() {
  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Resume State
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Job Extraction State
  const [jobData, setJobData] = useState<any | null>(null);
  const [extracting, setExtracting] = useState(true);
  const [manualMode, setManualMode] = useState(false);

  // Manual Input Form State
  const [manualTitle, setManualTitle] = useState("");
  const [manualCompany, setManualCompany] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [manualDescription, setManualDescription] = useState("");

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasAutoAnalyzed, setHasAutoAnalyzed] = useState(false);

  // Tracking State
  const [tracking, setTracking] = useState(false);
  const [trackedSuccess, setTrackedSuccess] = useState(false);

  // Additional Feature Action State
  const [activeTab, setActiveTab] = useState<"analysis" | "optimizer" | "cover_letter" | "interview">("analysis");
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const [optimizerResult, setOptimizerResult] = useState<any | null>(null);
  const [generatingOptimizer, setGeneratingOptimizer] = useState(false);

  const [interviewResult, setInterviewResult] = useState<any | null>(null);
  const [generatingInterview, setGeneratingInterview] = useState(false);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Computed fields
  const currentJD = manualMode ? manualDescription : jobData?.job_description || "";
  const currentTitle = manualMode ? manualTitle : jobData?.job_title || "Job Posting";
  const currentCompany = manualMode ? manualCompany : jobData?.company_name || "Company";

  // 1. Initial Load & Session Validation
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["access_token", "user", "selected_resume_id"], (res: Record<string, any>) => {
        if (res.access_token) {
          chrome.runtime.sendMessage({ action: "VERIFY_TOKEN" }, (verifyRes: any) => {
            if (verifyRes && verifyRes.success) {
              setToken(res.access_token);
              setUserEmail(verifyRes.data?.email || res.user || "Logged In");
              if (res.selected_resume_id) {
                setSelectedResumeId(res.selected_resume_id);
              }
              fetchResumes();
            } else {
              chrome.storage.local.remove(["access_token", "user", "selected_resume_id"]);
              setToken(null);
              setUserEmail(null);
              setAuthError("Session expired. Please log in again.");
            }
          });
        }
      });
    }

    extractActiveTabJob();
  }, []);

  // 2. Auto-run analysis when token, resume, and JD are all ready
  useEffect(() => {
    if (
      token &&
      selectedResumeId &&
      currentJD &&
      currentJD.trim().length >= 30 &&
      !extracting &&
      !loadingResumes &&
      !analyzing &&
      !analysisResult &&
      !hasAutoAnalyzed
    ) {
      setHasAutoAnalyzed(true);
      executeAnalysis(selectedResumeId, currentJD, currentTitle, currentCompany);
    }
  }, [
    token,
    selectedResumeId,
    currentJD,
    extracting,
    loadingResumes,
    analyzing,
    analysisResult,
    hasAutoAnalyzed,
  ]);

  const fetchResumes = () => {
    if (typeof chrome === "undefined" || !chrome.runtime) return;
    setLoadingResumes(true);
    chrome.runtime.sendMessage({ action: "FETCH_RESUMES" }, (res: any) => {
      setLoadingResumes(false);
      if (res && res.success && Array.isArray(res.data)) {
        setResumes(res.data);
        if (res.data.length > 0) {
          // Select user's MOST RECENTLY SUBMITTED resume (first item in sorted array)
          const firstResume = res.data[0];
          const firstId = firstResume.resume_id || firstResume.id || firstResume._id;
          
          setSelectedResumeId((prev) => {
            const exists = res.data.some((r: any) => (r.resume_id || r.id || r._id) === prev);
            const targetId = exists ? prev : firstId;
            if (typeof chrome !== "undefined" && chrome.storage) {
              chrome.storage.local.set({ selected_resume_id: targetId });
            }
            return targetId;
          });
        }
      } else if (res?.error === "NOT_AUTHENTICATED") {
        handleLogout();
        setAuthError("Session expired. Please log in again.");
      }
    });
  };

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    setHasAutoAnalyzed(false); // Allow auto-analysis on new selection if needed
    setAnalysisResult(null);
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.set({ selected_resume_id: id });
    }
  };

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
          // Infallible DOM script execution fallback
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id! },
              func: fallbackDOMExtractor,
            },
            (results: any[]) => {
              if (results && results[0] && results[0].result) {
                const extracted = results[0].result;
                setJobData(extracted);
                if (extracted.job_title) setManualTitle(extracted.job_title);
                if (extracted.company_name) setManualCompany(extracted.company_name);
                if (extracted.location) setManualLocation(extracted.location);
                if (extracted.job_description) setManualDescription(extracted.job_description);
              }
              setExtracting(false);
            }
          );
        } else {
          const extracted = response.data;
          setJobData(extracted);
          if (extracted.job_title) setManualTitle(extracted.job_title);
          if (extracted.company_name) setManualCompany(extracted.company_name);
          if (extracted.location) setManualLocation(extracted.location);
          if (extracted.job_description) setManualDescription(extracted.job_description);
          setExtracting(false);
        }
      });
    });
  };

  const handleUsePageContent = () => {
    if (typeof chrome === "undefined" || !chrome.tabs) return;
    setExtracting(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
      const tab = tabs[0];
      if (!tab || !tab.id) {
        setExtracting(false);
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_CONTENT" }, (res: any) => {
        setExtracting(false);
        if (res && res.success && res.content) {
          const newDesc = res.content;
          const updated = {
            job_title: jobData?.job_title || tab.title || "Job Posting",
            company_name: jobData?.company_name || formatHost(tab.url),
            location: jobData?.location || "",
            job_description: newDesc,
            job_url: tab.url || window.location.href,
            source_site: "Page Text",
            detected: Boolean(newDesc && newDesc.length >= 30),
          };
          setJobData(updated);
          setManualTitle(updated.job_title);
          setManualCompany(updated.company_name);
          setManualLocation(updated.location);
          setManualDescription(newDesc);
          setManualMode(false);
          setHasAutoAnalyzed(false);
        } else {
          setManualMode(true);
        }
      });
    });
  };

  const handleSaveManualJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDescription || manualDescription.trim().length < 10) {
      setError("Please paste a valid job description.");
      return;
    }
    const updated = {
      job_title: manualTitle || "Target Role",
      company_name: manualCompany || "Company",
      location: manualLocation || "",
      job_description: manualDescription,
      job_url: jobData?.job_url || "https://example.com",
      source_site: "Manual Input",
      detected: true,
    };
    setJobData(updated);
    setManualMode(false);
    setError(null);
    setHasAutoAnalyzed(false); // Trigger analysis for manually entered JD
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
          fetchResumes();
        } else {
          setAuthError(res?.error || "Login failed.");
        }
      }
    );
  };

  const handleLogout = () => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.remove(["access_token", "user", "selected_resume_id"], () => {
        setToken(null);
        setUserEmail(null);
        setResumes([]);
        setSelectedResumeId("");
        setAnalysisResult(null);
        setOptimizerResult(null);
        setCoverLetterText(null);
        setInterviewResult(null);
        setHasAutoAnalyzed(false);
      });
    }
  };

  const executeAnalysis = (
    resumeId: string,
    jd: string,
    title: string,
    company: string
  ) => {
    if (!jd || jd.trim().length < 20) {
      setError("Job description is too short to analyze.");
      return;
    }
    setAnalyzing(true);
    setError(null);
    setTrackedSuccess(false);

    chrome.runtime.sendMessage(
      {
        action: "ANALYZE_JOB",
        payload: {
          resume_id: resumeId || undefined,
          job_title: title,
          company_name: company,
          job_description: jd,
          job_url: jobData?.job_url || window.location.href || "",
          location: manualMode ? manualLocation : jobData?.location || "",
        },
      },
      (res: any) => {
        setAnalyzing(false);
        if (res && res.success) {
          setAnalysisResult(res.data);
          setActiveTab("analysis");
        } else {
          if (res?.error === "NOT_AUTHENTICATED") {
            handleLogout();
            setAuthError("Session expired. Please log in again.");
          } else {
            setError(res?.error || "Failed to analyze job.");
          }
        }
      }
    );
  };

  const handleRunAnalysis = () => {
    if (!currentJD) {
      setError("No job description available for analysis.");
      return;
    }
    executeAnalysis(selectedResumeId, currentJD, currentTitle, currentCompany);
  };

  const handleGenerateCoverLetter = () => {
    if (!selectedResumeId) {
      setError("Please select a resume first.");
      return;
    }
    if (!currentJD) {
      setError("No job description available.");
      return;
    }
    setGeneratingCoverLetter(true);
    setError(null);
    setActiveTab("cover_letter");

    chrome.runtime.sendMessage(
      {
        action: "GENERATE_COVER_LETTER",
        payload: {
          resume_id: selectedResumeId,
          job_description: currentJD,
        },
      },
      (res: any) => {
        setGeneratingCoverLetter(false);
        if (res && res.success && res.data) {
          setCoverLetterText(res.data.cover_letter || res.data);
        } else {
          if (res?.error === "NOT_AUTHENTICATED") {
            handleLogout();
            setAuthError("Session expired. Please log in again.");
          } else {
            setError(res?.error || "Failed to generate cover letter.");
          }
        }
      }
    );
  };

  const handleGenerateOptimizer = () => {
    if (!selectedResumeId) {
      setError("Please select a resume first.");
      return;
    }
    if (!currentJD) {
      setError("No job description available.");
      return;
    }
    setGeneratingOptimizer(true);
    setError(null);
    setActiveTab("optimizer");

    chrome.runtime.sendMessage(
      {
        action: "GENERATE_RESUME_IMPROVEMENT",
        payload: {
          resume_id: selectedResumeId,
          job_description: currentJD,
        },
      },
      (res: any) => {
        setGeneratingOptimizer(false);
        if (res && res.success && res.data) {
          setOptimizerResult(res.data);
        } else {
          if (res?.error === "NOT_AUTHENTICATED") {
            handleLogout();
            setAuthError("Session expired. Please log in again.");
          } else {
            setError(res?.error || "Failed to generate resume optimizations.");
          }
        }
      }
    );
  };

  const handleGenerateInterview = () => {
    if (!selectedResumeId) {
      setError("Please select a resume first.");
      return;
    }
    if (!currentJD) {
      setError("No job description available.");
      return;
    }
    setGeneratingInterview(true);
    setError(null);
    setActiveTab("interview");

    chrome.runtime.sendMessage(
      {
        action: "GENERATE_INTERVIEW_QUESTIONS",
        payload: {
          resume_id: selectedResumeId,
          job_description: currentJD,
        },
      },
      (res: any) => {
        setGeneratingInterview(false);
        if (res && res.success && res.data) {
          setInterviewResult(res.data);
        } else {
          if (res?.error === "NOT_AUTHENTICATED") {
            handleLogout();
            setAuthError("Session expired. Please log in again.");
          } else {
            setError(res?.error || "Failed to generate interview prep questions.");
          }
        }
      }
    );
  };

  const handleTrackApplication = () => {
    if (!jobData && !manualDescription) return;
    setTracking(true);
    setTrackedSuccess(false);

    chrome.runtime.sendMessage(
      {
        action: "TRACK_APPLICATION",
        payload: {
          job_title: currentTitle || "Target Role",
          company_name: currentCompany || "Company",
          job_description: currentJD,
          job_url: jobData?.job_url || "",
          location: manualMode ? manualLocation : jobData?.location || "",
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
          if (res?.error === "NOT_AUTHENTICATED") {
            handleLogout();
            setAuthError("Session expired. Please log in again.");
          } else {
            setError(res?.error || "Failed to track application.");
          }
        }
      }
    );
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const isDetected = Boolean(
    jobData?.detected ||
      (jobData?.job_title && jobData?.job_description && jobData.job_description.trim().length >= 30)
  );

  return (
    <div className="w-[380px] min-h-[520px] bg-slate-950 text-slate-100 p-4 font-sans flex flex-col justify-between">
      <div>
        <Header userEmail={userEmail} onLogout={handleLogout} />

        {/* 1. ONE-TIME LOGIN / AUTHENTICATION VIEW */}
        {!token ? (
          <div className="space-y-4 pt-3">
            <div className="text-center space-y-1">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-sm font-bold text-white">Log in to ApplyPilot</h2>
              <p className="text-[11px] text-slate-400">
                Connect your account once to analyze job postings and track applications on any website.
              </p>
            </div>

            {authError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] text-rose-400 text-center font-medium">
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
          <div className="space-y-3 pt-1">
            {/* 2. RESUME SELECTION CARD */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-indigo-400" /> Resume
                </span>
                <a
                  href="http://localhost:3000/dashboard/resumes"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] font-medium text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="h-3 w-3" /> Upload New <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              {loadingResumes ? (
                <div className="flex items-center justify-center p-2 text-[11px] text-slate-400 gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading resumes...
                </div>
              ) : resumes.length === 0 ? (
                <div className="p-2.5 text-center text-[11px] text-amber-400 bg-amber-500/10 rounded-lg border border-amber-500/20 space-y-1.5">
                  <p className="font-semibold">Please upload a resume first.</p>
                  <a
                    href="http://localhost:3000/dashboard/resumes"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/30 transition"
                  >
                    Upload Resume <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => handleSelectResume(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-800 py-1.5 px-2.5 pr-7 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                  >
                    {resumes.map((r) => {
                      const rId = r.resume_id || r.id || r._id || "";
                      return (
                        <option key={rId} value={rId}>
                          {r.title || r.original_filename || r.file_name || "Resume"}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              )}
            </div>

            {/* 3. JOB DETECTION & STATUS CARD */}
            {manualMode ? (
              <div className="rounded-xl border border-indigo-500/30 bg-slate-900/90 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <Edit3 className="h-3.5 w-3.5" /> Paste Job Details
                  </span>
                  <button
                    onClick={() => setManualMode(false)}
                    className="text-[10px] text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
                <form onSubmit={handleSaveManualJob} className="space-y-2">
                  <input
                    type="text"
                    placeholder="Job Title (e.g. Senior Software Engineer)"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-white"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      placeholder="Company"
                      value={manualCompany}
                      onChange={(e) => setManualCompany(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-white"
                    />
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Paste job description text here..."
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Use Provided Job Details
                  </button>
                </form>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  {extracting ? (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" /> Detecting Job...
                    </span>
                  ) : isDetected ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Job detected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
                      <AlertTriangle className="h-3 w-3" /> Could not detect the job description.
                    </span>
                  )}

                  {jobData?.source_site && (
                    <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                      {jobData.source_site}
                    </span>
                  )}
                </div>

                {/* Job Title & Company */}
                <div>
                  <h2 className="font-bold text-xs text-white leading-snug">
                    {extracting
                      ? "Analyzing page content..."
                      : currentTitle || "Unknown Job Title"}
                  </h2>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="h-3 w-3 text-slate-500" /> {currentCompany}
                    {jobData?.location && (
                      <span className="flex items-center gap-0.5 ml-1">
                        • <MapPin className="h-3 w-3 text-slate-500" /> {jobData.location}
                      </span>
                    )}
                  </p>
                </div>

                {/* Fallback actions if extraction failed */}
                {!extracting && !isDetected && (
                  <div className="pt-1.5 border-t border-slate-800/80 space-y-1.5">
                    <p className="text-[10px] text-slate-400">
                      Choose an option to supply the job description:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={handleUsePageContent}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-[11px] font-medium text-indigo-300 border border-slate-700"
                      >
                        Use Page Text
                      </button>
                      <button
                        onClick={() => setManualMode(true)}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-[11px] font-medium text-slate-300 border border-slate-700"
                      >
                        Paste JD Manually
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. AUTOMATIC ANALYSIS / LOADING / RE-ANALYZE STATUS */}
            {analyzing && (
              <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-4 text-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
                <p className="text-xs font-semibold text-white">Analyzing Job Fit automatically...</p>
                <p className="text-[10px] text-slate-400">Comparing job description against your selected resume.</p>
              </div>
            )}

            {/* Manual Re-analyze trigger if analysis failed or user modified parameters */}
            {!analysisResult && !analyzing && (
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing || extracting || !currentJD || resumes.length === 0}
                className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Analyze Job Fit</span>
              </button>
            )}

            {/* 5. ANALYSIS RESULTS & DATA REUSE TABS */}
            {analysisResult && (
              <div className="space-y-3">
                {/* Tabs to reuse the same JD & Resume */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className={`py-1.5 rounded-lg font-medium transition ${
                      activeTab === "analysis"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Match
                  </button>
                  <button
                    onClick={handleGenerateOptimizer}
                    className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                      activeTab === "optimizer"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {generatingOptimizer ? <Loader2 className="h-3 w-3 animate-spin" /> : "Optimize"}
                  </button>
                  <button
                    onClick={handleGenerateCoverLetter}
                    className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                      activeTab === "cover_letter"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {generatingCoverLetter ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cover Letter"}
                  </button>
                  <button
                    onClick={handleGenerateInterview}
                    className={`py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
                      activeTab === "interview"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {generatingInterview ? <Loader2 className="h-3 w-3 animate-spin" /> : "Interview"}
                  </button>
                </div>

                {/* TAB 1: MATCH ANALYSIS */}
                {activeTab === "analysis" && (
                  <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Job Match Score</span>
                      <span className="text-xl font-extrabold text-indigo-400">
                        {analysisResult.match_score}%
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
                      {/* Matched Skills */}
                      <div>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="h-3 w-3" /> Matching Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.matched_skills && analysisResult.matched_skills.length > 0 ? (
                            analysisResult.matched_skills.map((s: string, i: number) => (
                              <span
                                key={i}
                                className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/20"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">None detected</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div>
                        <span className="text-amber-400 font-semibold flex items-center gap-1 text-[11px]">
                          <XCircle className="h-3 w-3" /> Missing Skills:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysisResult.missing_skills && analysisResult.missing_skills.length > 0 ? (
                            analysisResult.missing_skills.map((s: string, i: number) => (
                              <span
                                key={i}
                                className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300 border border-amber-500/20"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-500 text-[10px]">None missing</span>
                          )}
                        </div>
                      </div>

                      {/* Key Recommendations */}
                      {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                        <div className="pt-1">
                          <span className="text-indigo-300 font-semibold text-[10px]">Key Recommendations:</span>
                          <ul className="list-disc list-inside text-[10px] text-slate-300 space-y-0.5 mt-0.5">
                            {analysisResult.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                              <li key={idx} className="line-clamp-2">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: RESUME OPTIMIZER */}
                {activeTab === "optimizer" && (
                  <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-3 space-y-2 max-h-[260px] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                        <Wand2 className="h-3.5 w-3.5" /> Optimize Resume
                      </span>
                      {optimizerResult && (
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(optimizerResult, null, 2), "optimizer")}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          {copiedText === "optimizer" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedText === "optimizer" ? "Copied" : "Copy Suggestions"}
                        </button>
                      )}
                    </div>

                    {generatingOptimizer ? (
                      <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-400" />
                        <p>Generating resume optimizations with AI...</p>
                      </div>
                    ) : optimizerResult ? (
                      <div className="space-y-2 text-[11px] text-slate-300">
                        {optimizerResult.professional_summary && (
                          <div>
                            <h4 className="font-semibold text-white text-[10px] uppercase tracking-wider">Suggested Summary:</h4>
                            <p className="p-2 rounded bg-slate-800 text-[10px] mt-0.5">{optimizerResult.professional_summary}</p>
                          </div>
                        )}
                        {optimizerResult.skills && (
                          <div>
                            <h4 className="font-semibold text-white text-[10px] uppercase tracking-wider">Recommended Skills to Highlight:</h4>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {optimizerResult.skills.map((sk: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-[10px] border border-indigo-500/20">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {optimizerResult.recommendations && (
                          <div>
                            <h4 className="font-semibold text-white text-[10px] uppercase tracking-wider">Action Steps:</h4>
                            <ul className="list-disc list-inside text-[10px] space-y-0.5 mt-0.5">
                              {optimizerResult.recommendations.map((r: string, i: number) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-[11px] text-slate-400 py-4">Click "Optimize" to view suggestions.</p>
                    )}
                  </div>
                )}

                {/* TAB 3: COVER LETTER */}
                {activeTab === "cover_letter" && (
                  <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-3 space-y-2 max-h-[260px] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" /> Tailored Cover Letter
                      </span>
                      {coverLetterText && (
                        <button
                          onClick={() => copyToClipboard(coverLetterText, "cover_letter")}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          {copiedText === "cover_letter" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedText === "cover_letter" ? "Copied" : "Copy Letter"}
                        </button>
                      )}
                    </div>

                    {generatingCoverLetter ? (
                      <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-400" />
                        <p>Generating cover letter with AI...</p>
                      </div>
                    ) : coverLetterText ? (
                      <div className="p-2.5 rounded bg-slate-800 text-[10px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {coverLetterText}
                      </div>
                    ) : (
                      <p className="text-center text-[11px] text-slate-400 py-4">Click "Cover Letter" to generate a tailored letter.</p>
                    )}
                  </div>
                )}

                {/* TAB 4: INTERVIEW PREP */}
                {activeTab === "interview" && (
                  <div className="rounded-xl border border-indigo-500/30 bg-slate-900 p-3 space-y-2 max-h-[260px] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                        <HelpCircle className="h-3.5 w-3.5" /> Interview Prep
                      </span>
                      {interviewResult && (
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(interviewResult, null, 2), "interview")}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          {copiedText === "interview" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedText === "interview" ? "Copied" : "Copy Questions"}
                        </button>
                      )}
                    </div>

                    {generatingInterview ? (
                      <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-indigo-400" />
                        <p>Preparing interview questions with AI...</p>
                      </div>
                    ) : interviewResult ? (
                      <div className="space-y-2 text-[11px] text-slate-300">
                        {interviewResult.technical && interviewResult.technical.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-emerald-400 text-[10px] uppercase">Technical Questions:</h4>
                            <ul className="space-y-1.5 mt-1">
                              {interviewResult.technical.slice(0, 3).map((q: any, i: number) => (
                                <li key={i} className="p-2 rounded bg-slate-800 text-[10px]">
                                  <p className="font-medium text-white">Q: {q.question}</p>
                                  {q.ideal_answer && <p className="text-slate-400 mt-0.5">Tip: {q.ideal_answer}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {interviewResult.behavioral && interviewResult.behavioral.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-amber-400 text-[10px] uppercase">Behavioral Questions:</h4>
                            <ul className="space-y-1.5 mt-1">
                              {interviewResult.behavioral.slice(0, 2).map((q: any, i: number) => (
                                <li key={i} className="p-2 rounded bg-slate-800 text-[10px]">
                                  <p className="font-medium text-white">Q: {q.question}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-[11px] text-slate-400 py-4">Click "Interview" to generate interview questions.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="text-[11px] text-rose-400 text-center font-medium">{error}</p>
            )}
          </div>
        )}
      </div>

      {/* FOOTER TRACK APPLICATION ACTION */}
      {token && (
        <div className="pt-3 border-t border-slate-800 mt-2">
          <button
            onClick={handleTrackApplication}
            disabled={tracking || trackedSuccess || (!currentJD && !manualDescription)}
            className={`w-full rounded-xl py-2 text-xs font-semibold shadow-md transition flex items-center justify-center gap-2 ${
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

// Infallible DOM extraction fallback function
function fallbackDOMExtractor() {
  const h1 = document.querySelector("h1");
  const job_title = h1 ? h1.innerText.trim() : document.title;
  const mainEl = document.querySelector("main") || document.querySelector("article") || document.body;
  const job_description = mainEl ? mainEl.innerText.slice(0, 4000).trim() : "";

  return {
    job_title,
    company_name: window.location.hostname.replace("www.", "").split(".")[0],
    job_url: window.location.href,
    job_description,
    source_site: "General",
    detected: Boolean(job_title && job_description.length >= 30),
  };
}

function formatHost(url?: string): string {
  if (!url) return "Company";
  try {
    const host = new URL(url).hostname.replace("www.", "");
    return host.split(".")[0].toUpperCase();
  } catch (e) {
    return "Company";
  }
}