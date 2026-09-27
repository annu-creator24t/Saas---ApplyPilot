"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useResume } from "@/context/ResumeContext";
import { useAuthContext } from "@/context/AuthContext";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight,
  FileCheck2,
} from "lucide-react";

interface DashboardData {
  total_resumes: number;
  total_analyses: number;
  average_score: number;
  highest_score: number;
  latest_resume?: string;
  latest_analysis_score?: number;
  applications_stats?: {
    TOTAL: number;
    BOOKMARKED: number;
    APPLIED: number;
    INTERVIEWING: number;
    OFFER: number;
    REJECTED: number;
  };
  recent_applications?: Array<{
    id: string;
    job_title: string;
    company_name: string;
    status: string;
    applied_date?: string;
    ats_score?: number;
  }>;
}

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { resumes, selectedResume, downloadResume } = useResume();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error("Failed to load dashboard data", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, authLoading]);

  const stats = data?.applications_stats || {
    TOTAL: 0,
    BOOKMARKED: 0,
    APPLIED: 0,
    INTERVIEWING: 0,
    OFFER: 0,
    REJECTED: 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OFFER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "INTERVIEWING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "APPLIED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "REJECTED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <span className="font-medium text-xs">Loading dashboard analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-4 sm:p-6 md:p-8 text-white shadow-xl animate-slide-up">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-cyan-200 border border-white/15 mb-2.5 sm:mb-3">
              <Sparkles className="h-3.5 w-3.5" /> ApplyPilot Copilot Active
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
              Job Application Command Center
            </h1>
            <p className="mt-1.5 sm:mt-2 max-w-xl text-xs sm:text-sm text-slate-200 leading-relaxed">
              Track job applications, match resumes against job descriptions with Gemini AI, run standalone ATS checks, and land more interviews.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto">
            <Link
              href="/dashboard/ats-checker"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg hover:bg-cyan-400 transition"
            >
              <FileCheck2 className="h-4 w-4" /> ATS Resume Checker
            </Link>
            <Link
              href="/dashboard/resume-optimizer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 transition"
            >
              <Sparkles className="h-4 w-4" /> AI Job Matcher
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-3.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Applications */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm animate-slide-up stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Applications</span>
            <div className="rounded-xl bg-blue-500/10 p-2 sm:p-2.5 text-blue-600 dark:text-blue-400">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.TOTAL}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{stats.APPLIED} active applications</p>
        </div>

        {/* Interviews Scheduled */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm animate-slide-up stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Interviews</span>
            <div className="rounded-xl bg-amber-500/10 p-2 sm:p-2.5 text-amber-600 dark:text-amber-400">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.INTERVIEWING}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">In interview process</p>
        </div>

        {/* Offers Received */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm animate-slide-up stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Job Offers</span>
            <div className="rounded-xl bg-emerald-500/10 p-2 sm:p-2.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{stats.OFFER}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Offers secured</p>
        </div>

        {/* Average ATS Match Score */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-5 shadow-sm animate-slide-up stagger-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avg ATS Score</span>
            <div className="rounded-xl bg-purple-500/10 p-2 sm:p-2.5 text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <p className="mt-2.5 sm:mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {data?.average_score ? `${data.average_score}%` : "N/A"}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {data?.highest_score ? `Peak score: ${data.highest_score}%` : "Analyze resume to calculate"}
          </p>
        </div>
      </div>

      {/* Main Grid: Recent Applications & AI Suite Quick Launch */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
        {/* Recent Applications Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm animate-slide-up stagger-2">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Recent Applications</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Tracked job opportunities & status</p>
            </div>
            <Link
              href="/dashboard/applications"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {!data?.recent_applications || data.recent_applications.length === 0 ? (
            <div className="py-10 sm:py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">No applications tracked yet</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Install the ApplyPilot Chrome Extension or click below to manually add applications.
              </p>
              <Link
                href="/dashboard/applications"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Application
              </Link>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs min-w-[420px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Company</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">ATS Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {data.recent_applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{app.job_title}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{app.company_name}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-700 dark:text-slate-300">
                        {app.ats_score ? `${app.ats_score}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Resume & Quick Tools */}
        <div className="space-y-6">
          {/* Active Resume Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm animate-slide-up stagger-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div className="truncate">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Master Resume</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                  {selectedResume?.title || selectedResume?.original_filename || data?.latest_resume || "No resume uploaded"}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Resumes:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{resumes.length || data?.total_resumes || 0}</span>
              </div>
              {selectedResume?.ats_score !== null && selectedResume?.ats_score !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Latest ATS Score:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedResume.ats_score}/100</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Link
                href="/dashboard/resumes"
                className="block text-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Manage Hub
              </Link>
              {selectedResume && (
                <button
                  onClick={() => downloadResume(selectedResume.resume_id, selectedResume.original_filename)}
                  className="block text-center rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
                >
                  Download File
                </button>
              )}
            </div>
          </div>

          {/* Quick AI Tools Suite */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm animate-slide-up stagger-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">AI Suite Quick Launch</h3>
            <div className="space-y-2">
              <Link
                href="/dashboard/ats-checker"
                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <FileCheck2 className="h-4 w-4 text-cyan-500 shrink-0" />
                  <span className="truncate">Standalone ATS Checker</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
              </Link>

              <Link
                href="/dashboard/resume-optimizer"
                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <Sparkles className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span className="truncate">Job Description Matcher</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
              </Link>

              <Link
                href="/dashboard/interview"
                className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <Award className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="truncate">Interview Prep AI</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}