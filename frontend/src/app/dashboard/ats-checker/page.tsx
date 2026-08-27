"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { useJobDescription } from "@/context/JobDescriptionContext";
import { analyzeResume } from "@/services/analysis.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import JobDescriptionSelector from "@/components/job/JobDescriptionSelector";
import { ATSAnalysis } from "@/types/analysis";
import { exportAsDocx, exportAsTxt, exportAsPdf } from "@/utils/export";
import {
  FileCheck2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Award,
  FileText,
  Zap,
  Info,
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";

function getScoreBadge(score: number) {
  if (score >= 80) {
    return {
      label: "Good ATS Compatibility",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      ringColor: "border-emerald-500 text-emerald-500",
    };
  }
  if (score >= 60) {
    return {
      label: "Moderate ATS Compatibility",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      ringColor: "border-amber-500 text-amber-500",
    };
  }
  return {
    label: "Needs Improvement",
    color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    ringColor: "border-rose-500 text-rose-500",
  };
}

export default function StandaloneATSCheckerPage() {
  const { selectedResume } = useResume();
  const { selectedJobDescription } = useJobDescription();

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ATSAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  const handleRunATSCheck = async () => {
    if (!selectedResume?.resume_id) {
      setErrorMsg("Please upload or select a resume to analyze.");
      return;
    }

    try {
      setAnalyzing(true);
      setErrorMsg(null);
      setQuotaReached(false);

      const res = await analyzeResume(selectedResume.resume_id);
      if (res?.data?.analysis) {
        setResult(res.data.analysis);
      }
    } catch (err: any) {
      const errCode = err?.response?.data?.error?.code || err?.response?.data?.code;
      const message = err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to run ATS analysis.";

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
    if (!result) return "";
    return `APPLYPILOT ATS AUDIT REPORT
Resume: ${selectedResume?.original_filename || "Master Resume"}
ATS Compatibility Score: ${result.ats_score}/100

SUMMARY:
${result.summary}

STRENGTHS:
${result.strengths?.map((s) => `- ${s}`).join("\n")}

WEAKNESSES:
${result.weaknesses?.map((w) => `- ${w}`).join("\n")}

FORMATTING:
${result.formatting}

GRAMMAR & TONE:
${result.grammar}

RECOMMENDATIONS:
${result.recommendations?.map((r) => `- ${r}`).join("\n")}
`;
  }, [result, selectedResume]);

  const handleExportDocx = useCallback(() => {
    if (!result) return;
    exportAsDocx(`ATS_Audit_Report_${selectedResume?.title || "Resume"}.doc`, "ApplyPilot ATS Audit Report", formatReportText());
  }, [result, selectedResume, formatReportText]);

  const handleExportTxt = useCallback(() => {
    if (!result) return;
    exportAsTxt(`ATS_Audit_Report_${selectedResume?.title || "Resume"}.txt`, formatReportText());
  }, [result, selectedResume, formatReportText]);

  const handleExportPdf = useCallback(() => {
    if (!result) return;
    exportAsPdf(`ATS_Audit_Report_${selectedResume?.title || "Resume"}.pdf`, "ApplyPilot ATS Audit Report", formatReportText());
  }, [result, selectedResume, formatReportText]);

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-3">
          <FileCheck2 className="h-3.5 w-3.5" /> Standalone Resume ATS Checker
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Resume ATS Checker
        </h1>
        <p className="mt-1 max-w-2xl text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Evaluate overall structure, formatting, keyword usage, readability, section completeness, and contact details with or without a target job description.
        </p>
      </div>

      {/* Grid: Independent Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeSelector
          title="Master Resume for ATS Scoring"
          subtitle="Choose an existing uploaded resume or upload a new file."
        />

        <JobDescriptionSelector
          title="Target Role (Optional)"
          subtitle="Optionally compare against a target role description."
        />
      </div>

      {/* Action Button Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Info className="h-4 w-4 text-cyan-500 shrink-0" />
          Evaluates ATS parsing compatibility, section completeness, formatting risks, and keyword impact.
        </p>

        <button
          onClick={handleRunATSCheck}
          disabled={analyzing || !selectedResume}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:opacity-90 disabled:opacity-50 transition"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing Resume...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Check ATS Score
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
                  {quotaReached ? "Free AI Credit Limit Exhausted" : "Analysis Notice"}
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

      {/* ATS Results View & Export Bar */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* ATS Score Header Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border-2 ${getScoreBadge(result.ats_score).ringColor} bg-slate-50 dark:bg-slate-950 shadow-inner`}>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {result.ats_score}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">/ 100</span>
                </div>

                <div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getScoreBadge(result.ats_score).color}`}>
                    {getScoreBadge(result.ats_score).label}
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                    ATS Audit Summary
                  </h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Report Export Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleExportDocx}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <FileSpreadsheet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Word (.doc)</span>
                </button>
                <button
                  onClick={handleExportPdf}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Printer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleExportTxt}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>TXT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Strengths vs Weaknesses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5" /> Strengths ({result.strengths?.length || 0})
              </h3>
              <ul className="space-y-2.5">
                {result.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span className="leading-relaxed">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5" /> Weaknesses / Risks ({result.weaknesses?.length || 0})
              </h3>
              <ul className="space-y-2.5">
                {result.weaknesses?.map((wk, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-rose-500 font-bold">⚠</span>
                    <span className="leading-relaxed">{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formatting & Grammar Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-cyan-500" /> Formatting & Layout Evaluation
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {result.formatting || "No specific formatting risks identified."}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Award className="h-4 w-4 text-indigo-500" /> Grammar & Tone Quality
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {result.grammar || "Grammar and phrasing look professional."}
              </p>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {result.recommendations?.length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-4">
                <ArrowRight className="h-5 w-5" /> Actionable Improvements
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 p-3.5 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                      →
                    </span>
                    <span className="leading-relaxed font-medium">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
