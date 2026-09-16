"use client";

import { useRef, useState } from "react";
import { uploadResume } from "@/services/resume.service";
import { getApiErrorMessage } from "@/utils/errors";
import { Loader2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

interface ResumeUploadProps {
  onUploadSuccess?: () => Promise<void> | void;
}

export default function ResumeUpload({
  onUploadSuccess,
}: ResumeUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = e.target.files?.[0];
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      setErrorMsg("Only PDF and DOCX files are allowed.");
      return;
    }

    setFile(selectedFile);
  }

  function resetForm() {
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!file) {
      setErrorMsg("Please choose a resume file to upload.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const response = await uploadResume(file);
      setSuccessMsg(response?.message || "Resume uploaded successfully!");
      resetForm();

      if (onUploadSuccess) {
        await onUploadSuccess();
      }
    } catch (error: unknown) {
      setErrorMsg(getApiErrorMessage(error, "Failed to upload resume. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">
        Upload Resume
      </h2>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-800 dark:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
        disabled={loading}
      >
        <Upload className="h-4 w-4" /> Choose Resume (.pdf, .docx)
      </button>

      {file && (
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800/60 p-3 text-xs text-slate-700 dark:text-slate-300">
          <p className="font-medium truncate">📄 {file.name}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-50 transition"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Uploading & Processing...
          </>
        ) : (
          "Upload Resume"
        )}
      </button>
    </div>
  );
}