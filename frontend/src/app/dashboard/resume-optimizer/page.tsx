"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { useJobDescription } from "@/context/JobDescriptionContext";
import { analyzeJob } from "@/services/job.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import JobDescriptionSelector from "@/components/job/JobDescriptionSelector";
import CopyButton from "@/components/common/CopyButton";
import { exportAsDocx, exportAsTxt, exportAsPdf } from "@/utils/export";
import { getApiErrorMessage } from "@/utils/errors";
import {
  Sparkles,
  Target,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  Download,
  FileSpreadsheet,
  Printer,
  FileText,
} from "lucide-react";

export default function ResumeOptimizerPage() {
  const { selectedResume } = useResume();
  const { selectedJobDescription } = useJobDescription();

  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  const handleJDChange = useCallback((jdText: string) => {
    setJobDescription(jdText);
  }, []);

  const handleAnalyzeMatch = async () => {
    if (!selectedResume?.resume_id) {
      setErrorMsg("Please select or upload a master resume.");
      return;
    }

    const targetJd = jobDescription.trim() || selectedJobDescription?.job_description || "";
    if (!targetJd) {
      setErrorMsg("Please select or enter a target job description.");
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg(null);
      setQuotaReached(false);

      const data = await analyzeJob({
        resume_id: selectedResume.resume_id,
        job_description: targetJd,
      });

      setMatchData(data);
    } catch (err: any) {
      const errCode = err?.response?.data?.error?.code || err?.response?.data?.code;
      const message = getApiErrorMessage(err, "Unable to analyze job match. Please try again.");

      if (errCode === "AI_USAGE_LIMIT_REACHED" || err?.response?.status === 403) {
        setQuotaReached(true);
        setErrorMsg(message);
      } else {
        setErrorMsg(message);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const formatReportText = useCallback(() => {
    if (!matchData) return "";
    const matchedSkills = matchData.matching_skills || matchData.matched_skills || [];
    const missingSkills = matchData.missing_skills || [];
    return `APPLYPILOT JOB MATCH & RESUME OPTIMIZATION REPORT
Resume: ${selectedResume?.original_filename || "Master Resume"}
Target Role: ${selectedJobDescription?.job_title || "Target Role"}
Match Score: ${matchData.match_score}/100

SUMMARY:
${matchData.summary}

MATCHING SKILLS:
${matchedSkills.map((s: string) => `- ${s}`).join("\n")}

MISSING SKILLS & GAPS:
${missingSkills.map((s: string) => `- ${s}`).join("\n")}

ACTIONABLE TAILORING RECOMMENDATIONS:
${matchData.recommendations?.map((r: string) => `- ${r}`).join("\n")}
`;
  }, [matchData, selectedResume, selectedJobDescription]);

  const handleExportDocx = useCallback(() => {
    if (!matchData) return;
    exportAsDocx(`Job_Match_Report_${selectedJobDescription?.company_name || "Target"}.doc`, "Job Match & Resume Optimization Report", formatReportText());
  }, [matchData, selectedJobDescription, formatReportText]);

  const handleExportTxt = useCallback(() => {
    if (!matchData) return;
    exportAsTxt(`Job_Match_Report_${selectedJobDescription?.company_name || "Target"}.txt`, formatReportText());
  }, [matchData, selectedJobDescription, formatReportText]);

  const handleExportPdf = useCallback(() => {
    if (!matchData) return;
    exportAsPdf(`Job_Match_Report_${selectedJobDescription?.company_name || "Target"}.pdf`, "Job Match & Resume Optimization Report", formatReportText());
  }, [matchData, selectedJobDescription, formatReportText]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-2">
          <Target className="h-3.5 w-3.5" /> AI Job Matcher & Resume Tailoring
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Resume Optimizer</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Compare your active master resume against any target job description to discover match score, keyword gaps, and instant bullet point optimizations.
        </p>
      </div>

      {/* Grid: Independent Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeSelector
          title="1. Active Master Resume"
          subtitle="Resume evaluated against target job requirements."
        />

        <JobDescriptionSelector
          title="2. Target Job Description"
          subtitle="Target role requirements to match and optimize against."
          onChangeJD={handleJDChange}
        />
      </div>

      {/* Action Button Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-3">
        <button
          type="button"
          onClick={handleAnalyzeMatch}
          disabled={analyzing || !selectedResume || !(jobDescription.trim() || selectedJobDescription?.job_description)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Job Match & Skills Gap...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Run AI Job Match Analysis
            </>
          )}
        </button>
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
                  {quotaReached ? "Free AI Credit Limit Exhausted" : "Notice"}
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

      {/* Optimization Results */}
      {matchData && (
        <div className="space-y-6 animate-slide-up">
          {/* Match Score Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl sm:text-3xl">
                  {matchData.match_score || 0}%
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Job Match Analysis Result
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    {matchData.summary}
                  </p>
                </div>
              </div>

              {/* Export Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 shrink-0 pt-2 lg:pt-0">
                <button
                  onClick={handleExportDocx}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Word (.doc)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Printer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportTxt}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>TXT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Matching Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5" /> Matching Skills & Keywords ({ (matchData.matching_skills || matchData.matched_skills || []).length })
              </h3>
              <div className="flex flex-wrap gap-2">
                {(matchData.matching_skills || matchData.matched_skills || []).map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
                <XCircle className="h-5 w-5" /> Missing Skills & Keyword Gaps ({matchData.missing_skills?.length || 0})
              </h3>
              <div className="flex flex-wrap gap-2">
                {matchData.missing_skills?.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
                  >
                    ✗ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tailoring Recommendations */}
          {matchData.recommendations?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Tailoring Recommendations
              </h3>
              <ul className="space-y-2.5">
                {matchData.recommendations.map((rec: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-indigo-500 font-bold">→</span>
                    <span>{rec}</span>
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