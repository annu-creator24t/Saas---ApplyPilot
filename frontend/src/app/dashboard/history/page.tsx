"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useAuthContext } from "@/context/AuthContext";
import { History as HistoryIcon, FileText, Calendar } from "lucide-react";

export default function HistoryPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchHistory = async () => {
      try {
        const res = await api.get("/analysis-history");
        if (res.data?.data) {
          setHistory(res.data.data);
        }
      } catch (err: any) {
        if (err?.response?.status !== 401) {
          console.error("Failed to load history", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isAuthenticated, authLoading]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
          <HistoryIcon className="h-3.5 w-3.5" /> Analysis Log
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">AI Analysis History</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">View past resume and job description AI evaluation reports.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">Loading analysis history...</div>
      ) : history.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 shadow-sm">
          <FileText className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No history reports found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Run an AI analysis on a job description or resume to store history.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id || item._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">{item.title || "AI Analysis"}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />{" "}
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
