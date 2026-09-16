"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { useJobDescription } from "@/context/JobDescriptionContext";
import { generateInterviewQuestions } from "@/services/interview-questions.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import JobDescriptionSelector from "@/components/job/JobDescriptionSelector";
import CopyButton from "@/components/common/CopyButton";
import { exportAsDocx, exportAsTxt, exportAsPdf } from "@/utils/export";
import { getApiErrorMessage } from "@/utils/errors";
import {
  HelpCircle,
  Sparkles,
  AlertTriangle,
  Loader2,
  Zap,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Printer,
  FileText,
} from "lucide-react";

export default function InterviewQuestionsPage() {
  const { selectedResume } = useResume();
  const { selectedJobDescription } = useJobDescription();

  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  // Sync active JD when selected from selector
  const handleJDChange = useCallback((jdText: string) => {
    setJobDescription(jdText);
  }, []);

  const handleGenerate = async () => {
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

      const response = await generateInterviewQuestions({
        resume_id: selectedResume.resume_id,
        job_description: targetJd,
      });

      setQuestionsData(response.data);
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code || error?.response?.data?.code;
      const message = getApiErrorMessage(error, "Failed to generate interview questions. Please try again.");

      if (errCode === "AI_USAGE_LIMIT_REACHED" || error?.response?.status === 403) {
        setQuotaReached(true);
        setErrorMsg(message);
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatQuestionsText = useCallback(() => {
    if (!questionsData) return "";
    const tech = questionsData.technical || questionsData.technical_questions || [];
    const beh = questionsData.behavioral || questionsData.behavioral_questions || [];
    const hr = questionsData.hr || questionsData.hr_questions || [];
    const tips = questionsData.tips || [];

    let text = `APPLYPILOT AI INTERVIEW PREPARATION QUESTIONS\nRole: ${selectedJobDescription?.job_title || "Target Role"}\nCompany: ${selectedJobDescription?.company_name || "Company"}\n\n`;

    if (tech.length) {
      text += `TECHNICAL QUESTIONS:\n${tech.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}\n\n`;
    }
    if (beh.length) {
      text += `BEHAVIORAL QUESTIONS:\n${beh.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}\n\n`;
    }
    if (hr.length) {
      text += `HR & CULTURE QUESTIONS:\n${hr.map((q: string, i: number) => `${i + 1}. ${q}`).join("\n")}\n\n`;
    }
    if (tips.length) {
      text += `INTERVIEW TIPS:\n${tips.map((t: string) => `- ${t}`).join("\n")}\n`;
    }

    return text;
  }, [questionsData, selectedJobDescription]);

  const handleExportDocx = useCallback(() => {
    if (!questionsData) return;
    exportAsDocx(`Interview_Questions_${selectedJobDescription?.company_name || "Target"}.doc`, "ApplyPilot Interview Preparation Questions", formatQuestionsText());
  }, [questionsData, selectedJobDescription, formatQuestionsText]);

  const handleExportTxt = useCallback(() => {
    if (!questionsData) return;
    exportAsTxt(`Interview_Questions_${selectedJobDescription?.company_name || "Target"}.txt`, formatQuestionsText());
  }, [questionsData, selectedJobDescription, formatQuestionsText]);

  const handleExportPdf = useCallback(() => {
    if (!questionsData) return;
    exportAsPdf(`Interview_Questions_${selectedJobDescription?.company_name || "Target"}.pdf`, "ApplyPilot Interview Preparation Questions", formatQuestionsText());
  }, [questionsData, selectedJobDescription, formatQuestionsText]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
          <HelpCircle className="h-3.5 w-3.5" /> AI Interview Question Generator
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Interview Question Prep</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Generate role-specific technical, behavioral, and HR interview questions based on your master resume and target job description.
        </p>
      </div>

      {/* Grid: Independent Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeSelector
          title="1. Active Master Resume"
          subtitle="Resume used to tailor technical and experience-based questions."
        />

        <JobDescriptionSelector
          title="2. Target Job Description"
          subtitle="Job role requirements used to extract interview questions."
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
              <Loader2 className="h-4 w-4 animate-spin" /> Generating Role-Specific Questions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Interview Questions
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

      {/* Generated Questions Output */}
      {questionsData && (
        (() => {
          const technicalList = questionsData.technical || questionsData.technical_questions || [];
          const behavioralList = questionsData.behavioral || questionsData.behavioral_questions || [];
          const hrList = questionsData.hr || questionsData.hr_questions || [];

          const getQuestionText = (q: any) => {
            if (typeof q === "string") return q;
            if (typeof q === "object" && q !== null) {
              return q.question || JSON.stringify(q);
            }
            return String(q);
          };

          const getIdealAnswer = (q: any) => {
            if (typeof q === "object" && q !== null && q.ideal_answer) {
              return q.ideal_answer;
            }
            return null;
          };

          return (
            <div className="space-y-6 animate-slide-up">
              {/* Header & Export Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Interview Question Set Ready
                </h2>

                <div className="flex items-center gap-2">
                  <CopyButton text={formatQuestionsText()} />
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
              </div>

              {/* Technical Questions */}
              {technicalList.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Technical & Skill Questions ({technicalList.length})
                  </h3>
                  <div className="space-y-3">
                    {technicalList.map((q: any, idx: number) => {
                      const qText = getQuestionText(q);
                      const ideal = getIdealAnswer(q);
                      return (
                        <div key={idx} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium space-y-2">
                          <div>
                            <span className="text-blue-500 font-bold mr-2">{idx + 1}.</span>
                            <span>{qText}</span>
                          </div>
                          {ideal && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-[11px] text-blue-900 dark:text-blue-200 font-normal">
                              <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">Ideal Answer Guide:</span>
                              {ideal}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Behavioral Questions */}
              {behavioralList.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Behavioral & Situation Questions (STAR Method) ({behavioralList.length})
                  </h3>
                  <div className="space-y-3">
                    {behavioralList.map((q: any, idx: number) => {
                      const qText = getQuestionText(q);
                      const ideal = getIdealAnswer(q);
                      return (
                        <div key={idx} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium space-y-2">
                          <div>
                            <span className="text-purple-500 font-bold mr-2">{idx + 1}.</span>
                            <span>{qText}</span>
                          </div>
                          {ideal && (
                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-[11px] text-purple-900 dark:text-purple-200 font-normal">
                              <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">Ideal Answer Guide:</span>
                              {ideal}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* HR Questions */}
              {hrList.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> HR & Culture Fit Questions ({hrList.length})
                  </h3>
                  <div className="space-y-3">
                    {hrList.map((q: any, idx: number) => {
                      const qText = getQuestionText(q);
                      const ideal = getIdealAnswer(q);
                      return (
                        <div key={idx} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-medium space-y-2">
                          <div>
                            <span className="text-emerald-500 font-bold mr-2">{idx + 1}.</span>
                            <span>{qText}</span>
                          </div>
                          {ideal && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-[11px] text-emerald-900 dark:text-emerald-200 font-normal">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Ideal Answer Guide:</span>
                              {ideal}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}