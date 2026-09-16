"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { useAuthContext } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/errors";
import { History as HistoryIcon, FileText, Calendar, ArrowRight, Award, AlertCircle, RefreshCw, Loader2 } from "lucide-react";

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get("/analysis-history");
      const raw = res.data?.data;
      if (raw && Array.isArray(raw.analyses)) {
        setHistory(raw.analyses);
      } else if (Array.isArray(raw)) {
        setHistory(raw);
      } else {
        setHistory([]);
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error("Failed to load history", err);
      }
      setErrorMsg(getApiErrorMessage(err, "Unable to load analysis history. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
    if (score >= 60) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
          <HistoryIcon className="h-3.5 w-3.5" /> Analysis Log
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Analysis History</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">View past resume and job description AI evaluation reports.</p>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Loading analysis history...</span>
        </div>
      ) : errorMsg ? (
        <div className="py-12 text-center rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-8 space-y-4">
          <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unable to load history</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">{errorMsg}</p>
          <button
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 shadow-sm">
          <FileText className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No history reports found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Run an AI analysis on a job description or resume to store history.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/dashboard/ats-checker"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-sm"
            >
              Run ATS Checker <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.analysis_id || item.id || item._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm hover:border-indigo-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                    {item.resume_name || item.title || "Resume ATS Analysis"}
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3 w-3 text-slate-400" />{" "}
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                {item.overall_score !== undefined && (
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border ${getScoreBadge(item.overall_score)}`}>
                    Score: {item.overall_score}/100
                  </span>
                )}
                <Link
                  href="/dashboard/ats-checker"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
