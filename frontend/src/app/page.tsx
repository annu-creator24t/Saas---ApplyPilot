"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  Sparkles,
  FileCheck2,
  Rocket,
  Mic,
  FileText,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 px-4 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
          <Sparkles className="h-4 w-4" /> Next-Gen AI Career & ATS Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight text-slate-900 dark:text-white">
          Land More Interviews with <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">ApplyPilot AI</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          Check your resume ATS compatibility without requiring job descriptions, optimize resumes for target roles, generate tailored interview questions, and practice AI interviews.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-600/25 hover:opacity-95 hover:scale-[1.02] transition"
          >
            Launch Free Copilot →
          </Link>

          <Link
            href="/dashboard/ats-checker"
            className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-2"
          >
            <FileCheck2 className="h-4 w-4 text-cyan-500" /> Free ATS Resume Check
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div id="features" className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-cyan-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mb-4">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Standalone ATS Checker</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Check ATS structure, formatting, keyword density, and grammar feedback without needing a job description.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-indigo-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Job Matcher</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Compare your master resume directly against any job posting to identify missing skills and tailored improvements.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm hover:border-purple-500/40 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mb-4">
              <Mic className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Interview Prep</h3>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate role-specific interview questions and receive instant AI answer evaluation and scoring.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <Rocket className="h-4 w-4 text-cyan-500" /> ApplyPilot AI Platform
          </div>
          <p>© 2026 ApplyPilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}