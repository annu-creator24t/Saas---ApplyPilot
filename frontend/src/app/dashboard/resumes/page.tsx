"use client";

import { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Download,
  Loader2,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function ResumesPage() {
  const {
    resumes,
    selectedResume,
    setSelectedResume,
    uploadResume,
    deleteResume,
    downloadResume,
    loading,
    uploading,
  } = useResume();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
      setSuccessMsg(null);
      await uploadResume(file);
      setSuccessMsg("Resume uploaded successfully and set as active master resume!");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to upload resume.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      setErrorMsg(null);
      await deleteResume(id);
      setSuccessMsg("Resume deleted successfully.");
    } catch (err) {
      console.error("Failed to delete resume", err);
    }
  };

  const handleDownload = async (resumeId: string, filename: string) => {
    try {
      setDownloadingId(resumeId);
      setErrorMsg(null);
      await downloadResume(resumeId, filename);
    } catch (err) {
      setErrorMsg("Failed to download original resume file.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Resume Management Hub</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Upload, manage, download, and select master resumes for AI ATS scoring and job matching.
          </p>
        </div>

        <label className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 cursor-pointer transition">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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

      {/* Messages */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">Loading resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-600" />
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">No resumes uploaded yet</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Upload your resume in PDF or DOCX format to get real-time AI ATS match scores on any job posting.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((res) => {
            const isSelected = selectedResume?.resume_id === res.resume_id;
            return (
              <div
                key={res.resume_id}
                className={`flex flex-col justify-between rounded-2xl border p-5 transition shadow-sm relative ${
                  isSelected
                    ? "border-indigo-500 bg-gradient-to-b from-indigo-500/5 via-white to-white dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900/60 ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-indigo-500/40"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                      }`}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {res.title || res.original_filename}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Uploaded {new Date(res.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Star className="h-3 w-3 fill-emerald-500" /> Active
                      </span>
                    )}
                  </div>

                  {res.extracted_text && (
                    <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800/80">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 italic">
                        &quot;{res.extracted_text.slice(0, 180)}...&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-3 border-t border-slate-200 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    {/* Make Active Button */}
                    {!isSelected ? (
                      <button
                        onClick={() => setSelectedResume(res)}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" /> Set Active
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Active Master Resume</span>
                    )}

                    <div className="flex items-center gap-2">
                      {/* Download Button */}
                      <button
                        onClick={() => handleDownload(res.resume_id, res.original_filename)}
                        disabled={downloadingId === res.resume_id}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-indigo-400 hover:underline text-xs"
                        title="Download original PDF/DOCX file"
                      >
                        {downloadingId === res.resume_id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        <span>Download</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(res.resume_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                        title="Delete resume"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
