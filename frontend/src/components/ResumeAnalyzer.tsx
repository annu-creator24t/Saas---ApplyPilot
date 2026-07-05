"use client";

import { useState } from "react";
import { analyzeResume } from "@/services/api";
import ResultDashboard from "./ResultDashboard";
import { useResume } from "@/context/ResumeContext";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    result,
    setResult,
    setResumeText,
    jobDescription,
    setJobDescription,
  } = useResume();

  async function handleAnalyze() {
    if (!file) {
      alert("Please upload your resume.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter the job description.");
      return;
    }

    try {
      setLoading(true);

      const data = await analyzeResume(file, jobDescription);

console.log("API Response:", data);

setResumeText(data.resume_text);
setResult(data.analysis);

console.log("Resume Text:", data.resume_text);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">

      {/* Upload Resume */}
      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <h2 className="text-3xl font-bold">
          📄 Upload Resume
        </h2>

        <p className="mt-2 text-slate-500">
          Upload your resume in PDF format.
        </p>

        <label
          htmlFor="resume-upload"
          className="mt-8 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-12 transition hover:border-cyan-500 hover:bg-cyan-100"
        >
          <div className="text-6xl">📄</div>

          <h3 className="mt-5 text-xl font-bold text-slate-700">
            Drag & Drop Resume
          </h3>

          <p className="mt-2 text-slate-500">
            or click here to browse
          </p>

          <p className="mt-3 text-sm text-slate-400">
            PDF Only • Maximum 5 MB
          </p>

          <input
            id="resume-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />
        </label>

        {file && (
          <div className="mt-5 rounded-xl bg-green-50 p-4">

            <p className="font-semibold text-green-700">
              ✅ Selected File
            </p>

            <p className="mt-1 text-green-600">
              {file.name}
            </p>

          </div>
        )}

      </div>

      {/* Job Description */}
      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <h2 className="text-3xl font-bold">
          📝 Job Description
        </h2>

        <p className="mt-2 text-slate-500">
          Paste the complete job description below.
        </p>

        <textarea
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="mt-6 w-full rounded-2xl border border-slate-300 p-5 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
        />

      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full rounded-2xl bg-cyan-600 py-5 text-lg font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">

            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

            AI is analyzing your resume...

          </div>
        ) : (
          "🚀 Analyze Resume"
        )}
      </button>

      {/* Results */}
      {result && <ResultDashboard />}

    </div>
  );
}