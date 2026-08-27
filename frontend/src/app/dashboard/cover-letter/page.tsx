"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { useJobDescription } from "@/context/JobDescriptionContext";
import { generateCoverLetter } from "@/services/coverLetter.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import JobDescriptionSelector from "@/components/job/JobDescriptionSelector";
import CopyButton from "@/components/common/CopyButton";
import { exportAsDocx, exportAsTxt, exportAsPdf } from "@/utils/export";
import {
  FileText,
  Sparkles,
  FileCode,
  AlertTriangle,
  Loader2,
  Zap,
  Download,
  FileSpreadsheet,
  Printer,
} from "lucide-react";

export default function CoverLetterPage() {
  const { selectedResume } = useResume();
  const { selectedJobDescription } = useJobDescription();

  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  // Sync active JD when selected from selector
  const handleJDChange = useCallback((jdText: string) => {
    setJobDescription(jdText);
  }, []);

  async function handleGenerate() {
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
      setLoading(true);
      setErrorMsg(null);
      setQuotaReached(false);

      const response = await generateCoverLetter({
        resume_id: selectedResume.resume_id,
        job_description: targetJd,
      });

      setCoverLetter(response.data.cover_letter);
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code || error?.response?.data?.code;
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || "Failed to generate cover letter.";

      if (errCode === "AI_USAGE_LIMIT_REACHED" || error?.response?.status === 403) {
        setQuotaReached(true);
        setErrorMsg(message);
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleExportDocx = useCallback(() => {
    if (!coverLetter) return;
    const title = `Cover Letter - ${selectedJobDescription?.job_title || "Target Role"}`;
    exportAsDocx(`Cover_Letter_${selectedJobDescription?.company_name || "Company"}.doc`, title, coverLetter);
  }, [coverLetter, selectedJobDescription]);

  const handleExportTxt = useCallback(() => {
    if (!coverLetter) return;
    exportAsTxt(`Cover_Letter_${selectedJobDescription?.company_name || "Company"}.txt`, coverLetter);
  }, [coverLetter, selectedJobDescription]);

  const handleExportPdf = useCallback(() => {
    if (!coverLetter) return;
    const title = `Cover Letter - ${selectedJobDescription?.job_title || "Target Role"}`;
    exportAsPdf(`Cover_Letter_${selectedJobDescription?.company_name || "Company"}.pdf`, title, coverLetter);
  }, [coverLetter, selectedJobDescription]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> AI Cover Letter Generator
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Cover Letter Generator</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Generate a tailored, high-converting cover letter using your active master resume and target job description.</p>
      </div>

      {/* Grid: Independent Resume & JD Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeSelector
          title="1. Active Master Resume"
          subtitle="Resume details used to personalize your application."
        />

        <JobDescriptionSelector
          title="2. Target Job Description"
          subtitle="Job role requirements used to tailor your cover letter."
          onChangeJD={handleJDChange}
        />
      </div>

      {/* Action Button Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !selectedResume || !(jobDescription.trim() || selectedJobDescription?.job_description)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating Tailored Cover Letter...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Cover Letter
            </>
          )}
        </button>
      </div>

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

      {/* Generated Output & Download Section */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCode className="h-4 w-4 text-purple-500" /> Generated Cover Letter
          </h2>

          {coverLetter && (
            <div className="flex items-center gap-2">
              <CopyButton text={coverLetter} />
              <button
                onClick={handleExportDocx}
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Word (.doc)</span>
              </button>
              <button
                onClick={handleExportPdf}
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Printer className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                <span>PDF</span>
              </button>
              <button
                onClick={handleExportTxt}
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>TXT</span>
              </button>
            </div>
          )}
        </div>

        <div className="min-h-[250px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 text-xs leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
          {coverLetter ? (
            coverLetter
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500 space-y-2">
              <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p>Your generated cover letter will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}