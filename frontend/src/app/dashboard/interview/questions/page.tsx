"use client";

import { useState } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { generateInterviewQuestions } from "@/services/interview-questions.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import { InterviewQuestion, InterviewQuestionsResponse } from "@/types/interview-questions";
import { HelpCircle, Sparkles, Code2, Users, Briefcase, ChevronDown, Loader2, AlertTriangle, Zap } from "lucide-react";

export default function InterviewQuestionsPage() {
  const { selectedResume } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<InterviewQuestionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  async function handleGenerate() {
    if (!selectedResume?.resume_id) {
      setErrorMsg("Please select or upload a resume.");
      return;
    }

    if (!jobDescription.trim()) {
      setErrorMsg("Please enter a target job description.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setQuotaReached(false);

      const response = await generateInterviewQuestions({
        resume_id: selectedResume.resume_id,
        job_description: jobDescription,
      });
      setResult(response.data);
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code || error?.response?.data?.code;
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || "Failed to generate interview questions.";

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

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
          <HelpCircle className="h-3.5 w-3.5" /> AI Interview Prep
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Interview Question Generator</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Generate technical, behavioral, and HR questions tailored to your resume and target role.</p>
      </div>

      {/* Reusable Resume Selector */}
      <ResumeSelector
        title="Master Resume for Interview Questions"
        subtitle="Questions will be tailored to match your active resume."
      />

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Job Description *</label>
        <textarea
          rows={6}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the Job Description here..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !selectedResume || !jobDescription.trim()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating Questions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Questions
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

      {result && (
        <div className="space-y-8">
          <QuestionSection title="Technical Questions" icon={<Code2 className="h-4 w-4 text-indigo-500" />} questions={result.technical} />
          <QuestionSection title="Behavioral Questions" icon={<Users className="h-4 w-4 text-emerald-500" />} questions={result.behavioral} />
          <QuestionSection title="HR & Situational Questions" icon={<Briefcase className="h-4 w-4 text-amber-500" />} questions={result.hr} />
        </div>
      )}
    </div>
  );
}

interface QuestionSectionProps {
  title: string;
  icon: React.ReactNode;
  questions: InterviewQuestion[];
}

function QuestionSection({ title, icon, questions }: QuestionSectionProps) {
  if (!questions || !questions.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
        {icon} {title}
      </h2>

      <div className="space-y-3">
        {questions.map((q, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                {idx + 1}. {q.question}
              </h3>
              <span className="shrink-0 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {q.category}
              </span>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                Show Ideal Answer <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
              </summary>
              <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {q.ideal_answer}
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}