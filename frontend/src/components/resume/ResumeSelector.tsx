"use client";

import { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import {
  FileText,
  Upload,
  Download,
  CheckCircle2,
  ChevronDown,
  Loader2,
  AlertCircle,
  Plus,
  Layers,
} from "lucide-react";

interface ResumeSelectorProps {
  title?: string;
  subtitle?: string;
  showDetails?: boolean;
  className?: string;
}

export default function ResumeSelector({
  title = "Active Master Resume",
  subtitle = "Selected resume will be used for AI ATS scoring, matching & tailoring.",
  showDetails = true,
  className = "",
}: ResumeSelectorProps) {
  const {
    resumes,
    selectedResume,
    selectResumeById,
    uploadResume,
    downloadResume,
    loading,
    uploading,
  } = useResume();

  const [isChanging, setIsChanging] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds maximum limit of 5MB.");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setErrorMsg("Only PDF and DOCX file formats are supported.");
      return;
    }

    try {
      setErrorMsg(null);
      await uploadResume(file);
      setIsChanging(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to upload resume.");
    }
  };

  const handleDownload = async () => {
    if (!selectedResume) return;
    try {
      setDownloading(true);
      setErrorMsg(null);
      await downloadResume(
        selectedResume.resume_id,
        selectedResume.original_filename || `${selectedResume.title || "resume"}.pdf`
      );
    } catch (err: any) {
      setErrorMsg("Failed to download original resume file.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        <span>Loading master resumes...</span>
      </div>
    );
  }

  // NO RESUMES UPLOADED STATE
  if (!resumes || resumes.length === 0) {
    return (
      <div className={`rounded-2xl border border-dashed border-indigo-400/50 dark:border-indigo-500/40 bg-indigo-500/5 p-6 shadow-sm text-center space-y-4 ${className}`}>
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Upload className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Upload Your Master Resume
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Upload a PDF or DOCX file once to unlock ATS analysis, Job Matching, Cover Letters, and Interview Prep.
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-center justify-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-xl border border-rose-200 dark:border-rose-500/20 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <label className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:opacity-90 cursor-pointer transition">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span>{uploading ? "Uploading..." : "Choose Resume File (PDF/DOCX)"}</span>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    );
  }

  // ACTIVE RESUME SELECTED STATE
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {title}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {selectedResume && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Download original uploaded file"
            >
              {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-blue-600 dark:text-indigo-400" />}
              <span>Download File</span>
            </button>
          )}

          <button
            onClick={() => setIsChanging(!isChanging)}
            type="button"
            className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{isChanging ? "Done" : "Change Resume"}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isChanging ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Selected Card */}
      {selectedResume && !isChanging && (
        <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">
                {selectedResume.title || selectedResume.original_filename || "Master Resume"}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{selectedResume.original_filename}</span>
                <span>•</span>
                <span>Uploaded {new Date(selectedResume.created_at).toLocaleDateString()}</span>
              </p>
            </div>
          </div>

          {showDetails && selectedResume.ats_score !== null && (
            <div className="shrink-0 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ATS Score</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {selectedResume.ats_score}/100
              </span>
            </div>
          )}
        </div>
      )}

      {/* Changing / Select Dropdown Box */}
      {isChanging && (
        <div className="space-y-3 pt-1 animate-in fade-in duration-200">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select an existing uploaded resume:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
            {resumes.map((r) => {
              const isSelected = selectedResume?.resume_id === r.resume_id;
              return (
                <button
                  key={r.resume_id}
                  type="button"
                  onClick={() => {
                    selectResumeById(r.resume_id);
                    setIsChanging(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                  }`}
                >
                  <div className="truncate mr-2">
                    <p className="truncate font-semibold">{r.title || r.original_filename}</p>
                    <p className="text-[10px] opacity-75">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Upload In Place Option */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Or upload a new file:</span>
            <label className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 text-indigo-500" />}
              <span>{uploading ? "Uploading..." : "Upload New Resume"}</span>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-200 dark:border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
