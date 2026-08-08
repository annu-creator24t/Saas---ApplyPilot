"use client";

import { useState } from "react";
import Link from "next/link";
import { analyzeJob, JobMatchResponse } from "@/services/job.service";
import { createApplication } from "@/services/application.service";
import { useResume } from "@/context/ResumeContext";
import ResumeSelector from "@/components/resume/ResumeSelector";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Key,
  Lightbulb,
  Plus,
  Loader2,
  AlertTriangle,
  Zap,
} from "lucide-react";

export default function ResumeOptimizerPage() {
  const { selectedResume } = useResume();
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingApp, setSavingApp] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [result, setResult] = useState<JobMatchResponse | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setErrorMsg("Please paste a job description.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setQuotaReached(false);
      setSavedSuccess(false);

      const res = await analyzeJob({
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        resume_id: selectedResume?.resume_id || undefined,
      });
      setResult(res);
    } catch (err: any) {
      const errCode = err?.response?.data?.error?.code || err?.response?.data?.code;
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to analyze job description.";

      if (errCode === "AI_USAGE_LIMIT_REACHED" || err?.response?.status === 403) {
        setQuotaReached(true);
        setErrorMsg(message);
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToTracker = async () => {
    if (!result) return;
    try {
      setSavingApp(true);
      await createApplication({
        job_title: jobTitle || result.job_title || "Target Role",
        company_name: companyName || result.company_name || "Company",
        job_description: jobDescription,
        status: "APPLIED",
        ats_score: result.match_score,
        matched_skills: result.matched_skills,
        missing_skills: result.missing_skills,
      });
      setSavedSuccess(true);
    } catch (err) {
      console.error("Failed to save application", err);
    } finally {
      setSavingApp(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
          <Sparkles className="h-3.5 w-3.5" /> AI Job Description & ATS Matcher
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">AI Resume & Job Matcher</h1>
        <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Paste any job description to compare it against your resume, analyze skill gaps, and optimize your ATS match score.
        </p>
      </div>

      {/* Resume Selector Component */}
      <ResumeSelector
        title="Master Resume for Job Matcher"
        subtitle="This resume will be compared against the target job posting below."
      />

      {/* Input Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Job Title</label>
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Job Description *</label>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste full job description requirements here..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !jobDescription.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{loading ? "Analyzing Job Fit..." : "Run AI Analysis"}</span>
          </button>
        </div>
      </div>

      {/* Error & Quota Alert */}
      {errorMsg && (
        <div className={`rounded-2xl p-5 border shadow-sm ${
          quotaReached
            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200"
            : "bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-900 dark:text-rose-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-xs md:text-sm">
                  {quotaReached ? "Free AI Credit Limit Exhausted" : "Analysis Error"}
                </h3>
                <p className="mt-0.5 text-xs opacity-90">{errorMsg}</p>
              </div>
            </div>

            {quotaReached && (
              <Link
                href="/dashboard/subscription"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition shrink-0"
              >
                <Zap className="h-4 w-4" /> Upgrade to Pro (₹99/mo)
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Top Score Banner & Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white gap-4 shadow-lg">
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/30 text-cyan-300 font-extrabold text-2xl border border-indigo-400/40">
                {result.match_score}%
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">ATS Job Match Score</h2>
                <p className="text-xs text-slate-300 max-w-lg mt-1">{result.summary}</p>
              </div>
            </div>

            <button
              onClick={handleSaveToTracker}
              disabled={savingApp || savedSuccess}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition ${
                savedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
              }`}
            >
              {savingApp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : savedSuccess ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{savedSuccess ? "Application Saved!" : "Save Application to Tracker"}</span>
            </button>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-4">
                <CheckCircle2 className="h-5 w-5" /> Matched Skills ({result.matched_skills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-xl bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm mb-4">
                <XCircle className="h-5 w-5" /> Missing / Weak Skills ({result.missing_skills?.length || 0})
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-xl bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  >
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Key Keywords */}
          {result.key_keywords?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-4">
                <Key className="h-5 w-5" /> Key Job Keywords
              </div>
              <div className="flex flex-wrap gap-2">
                {result.key_keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-xl bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-300 border border-indigo-500/20"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Tailoring Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-bold text-sm mb-4">
                <Lightbulb className="h-5 w-5" /> Tailoring Recommendations
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[11px] font-bold text-purple-600 dark:text-purple-300">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}