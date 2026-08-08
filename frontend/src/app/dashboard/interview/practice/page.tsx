"use client";

import { useState } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { useJobDescription } from "@/context/JobDescriptionContext";
import { startInterviewPractice, evaluateAnswer } from "@/services/interview-practice.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import JobDescriptionSelector from "@/components/job/JobDescriptionSelector";
import {
  Mic,
  Sparkles,
  AlertTriangle,
  Loader2,
  Send,
  Award,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function InterviewPracticePage() {
  const { selectedResume } = useResume();
  const { selectedJobDescription } = useJobDescription();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  const handleJDChange = (jdText: string) => {
    setJobDescription(jdText);
  };

  const handleStartPractice = async () => {
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
      setFeedback(null);
      setUserAnswer("");
      setCurrentIndex(0);

      const response = await startInterviewPractice({
        resume_id: selectedResume.resume_id,
        job_description: targetJd,
      });

      setSession(response.data);
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code || error?.response?.data?.code;
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || "Failed to start practice session.";

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

  const questionsList = session?.questions || (session?.current_question ? [session.current_question] : []);
  const rawCurrent = questionsList[currentIndex];
  const currentQuestionText = typeof rawCurrent === "object" && rawCurrent !== null
    ? rawCurrent.question || JSON.stringify(rawCurrent)
    : (typeof rawCurrent === "string" ? rawCurrent : "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !currentQuestionText) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const response = await evaluateAnswer({
        question: currentQuestionText,
        answer: userAnswer,
      });

      setFeedback(response.data);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.message || "Failed to analyze practice answer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setUserAnswer("");
    setFeedback(null);
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-2">
          <Mic className="h-3.5 w-3.5" /> AI Mock Interview Practice
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Interview Simulator</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Simulate a real-time AI interview session tailored to your active resume and target role. Type or speak your response for instant feedback.
        </p>
      </div>

      {/* Grid: Independent Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeSelector
          title="1. Active Master Resume"
          subtitle="Resume background used to personalize mock questions."
        />

        <JobDescriptionSelector
          title="2. Target Job Description"
          subtitle="Job role requirements used to simulate interviewer prompts."
          onChangeJD={handleJDChange}
        />
      </div>

      {/* Action Button Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-3">
        <button
          type="button"
          onClick={handleStartPractice}
          disabled={loading || !selectedResume || !(jobDescription.trim() || selectedJobDescription?.job_description)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing AI Interview Session...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Start Mock Interview Session
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

      {/* Practice Interview Session */}
      {session && questionsList.length > 0 && (
        currentIndex < questionsList.length ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Interviewer Prompt {currentIndex + 1} of {questionsList.length}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Question {currentIndex + 1}/{questionsList.length}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                &quot;{currentQuestionText}&quot;
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <textarea
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting || !userAnswer.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Evaluating Answer...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Submit Answer for AI Feedback
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Feedback Output */}
            {feedback && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-500" /> AI Feedback & Evaluation
                  </h3>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    Score: {feedback.score ?? feedback.overall_score ?? 85}/100
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">Strengths & Feedback:</span>
                    {typeof feedback.feedback === "string" ? feedback.feedback : (feedback.strengths ? feedback.strengths.join(", ") : JSON.stringify(feedback))}
                  </div>

                  {(feedback.improved_answer || feedback.ideal_answer) && (
                    <div className="bg-cyan-500/10 dark:bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20 leading-relaxed text-slate-900 dark:text-slate-100">
                      <span className="font-bold text-cyan-600 dark:text-cyan-400 block mb-1">Model / Improved Response:</span>
                      {feedback.improved_answer || feedback.ideal_answer}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
                  >
                    <span>Next Question</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 p-8 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Mock Interview Session Completed!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              You answered all role-specific interview questions for this practice session. You can review your feedback or start another practice set anytime.
            </p>
            <button
              type="button"
              onClick={handleStartPractice}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition"
            >
              <Sparkles className="h-4 w-4" /> Start New Practice Session
            </button>
          </div>
        )
      )}
    </div>
  );
}