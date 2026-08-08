"use client";

import Link from "next/link";
import { Mic, BookOpen, Target, ArrowRight, Sparkles } from "lucide-react";

export default function InterviewPage() {
  return (
    <div className="space-y-8 pb-12">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-3">
          <Sparkles className="h-3.5 w-3.5" /> AI Interview Suite
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Interview Preparation Hub
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Prepare smarter with AI-generated interview questions or practice a complete interactive mock interview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          href="/dashboard/interview/questions"
          className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-sm transition-all hover:border-indigo-500/50 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-6 group-hover:scale-105 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Interview Questions</span>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </h2>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generate technical, behavioral, and HR questions based on your resume and target job role with AI-generated ideal answers.
          </p>
        </Link>

        <Link
          href="/dashboard/interview/practice"
          className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-sm transition-all hover:border-cyan-500/50 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-6 group-hover:scale-105 transition-transform">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Interview Practice</span>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
          </h2>
          <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Practice mock interviews, type or submit answers, receive real-time AI evaluation, scores, and constructive feedback.
          </p>
        </Link>
      </div>
    </div>
  );
}