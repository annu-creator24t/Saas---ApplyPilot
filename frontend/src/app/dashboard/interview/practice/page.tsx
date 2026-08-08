"use client";

import { useState } from "react";
import Link from "next/link";
import { useResume } from "@/context/ResumeContext";
import { startInterviewPractice, evaluateAnswer } from "@/services/interview-practice.service";
import ResumeSelector from "@/components/resume/ResumeSelector";
import PracticeQuestion from "@/components/interview/PracticeQuestion";
import EvaluationCard from "@/components/interview/EvaluationCard";
import InterviewSummary from "@/components/interview/InterviewSummary";
import { PracticeQuestion as Question, Evaluation } from "@/types/interview-practice";
import { Mic, Sparkles, CheckCircle2, ArrowRight, Loader2, AlertTriangle, Zap } from "lucide-react";

export default function InterviewPracticePage() {
  const { selectedResume } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [results, setResults] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [quotaReached, setQuotaReached] = useState(false);

  async function handleStart() {
    if (!selectedResume?.resume_id) {
      setErrorMsg("Please select or upload a resume to start practice.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setQuotaReached(false);

      const response = await startInterviewPractice({
        resume_id: selectedResume.resume_id,
        job_description: jobDescription,
      });

      setQuestions(response.data.questions);
      setCurrent(0);
      setAnswer("");
      setEvaluation(null);
      setResults([]);
      setCompleted(false);
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code || error?.response?.data?.code;
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || "Failed to start interview session.";

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

  async function handleEvaluate() {
    if (!answer.trim()) {
      setErrorMsg("Answer cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);

      const response = await evaluateAnswer({
        question: questions[current].question,
        answer,
      });

      setEvaluation(response.data);
      setResults((prev) => {
        const copy = [...prev];
        copy[current] = response.data;
        return copy;
      });
    } catch (error: any) {
      const errCode = error?.response?.data?.error?.code || error?.response?.data?.code;
      const message = error?.response?.data?.error?.message || error?.response?.data?.message || "Evaluation failed.";

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

  function nextQuestion() {
    if (current === questions.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrent((prev) => prev + 1);
    setAnswer("");
    setEvaluation(null);
  }

  if (completed) {
    return <InterviewSummary results={results} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-2">
          <Mic className="h-3.5 w-3.5" /> Interactive Practice
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Interview Simulator</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Practice real interview questions and receive instant AI feedback on your answers.</p>
      </div>

      {/* Reusable Resume Selector */}
      <ResumeSelector
        title="Master Resume for Interview Simulation"
        subtitle="Questions and feedback will align with your active resume."
      />

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

      {questions.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Target Job Description (Optional)</label>
          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste Job Description..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />

          <button
            onClick={handleStart}
            disabled={loading || !selectedResume}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing Practice Session...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Start Interview Session
              </>
            )}
          </button>
        </div>
      )}

      {questions.length > 0 && !completed && (
        <div className="space-y-6">
          <PracticeQuestion
            question={questions[current]}
            answer={answer}
            setAnswer={setAnswer}
          />

          {!evaluation && (
            <button
              onClick={handleEvaluate}
              disabled={loading || !answer.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Evaluating Answer...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Submit & Evaluate Answer
                </>
              )}
            </button>
          )}

          {evaluation && (
            <div className="space-y-4">
              <EvaluationCard evaluation={evaluation} />

              <button
                onClick={nextQuestion}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
              >
                {current === questions.length - 1 ? "Finish & View Summary" : "Next Question"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}