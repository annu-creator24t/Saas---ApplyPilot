"use client";

import { useCallback, useEffect, useState } from "react";

import { analyzeResume } from "@/services/analysis.service";
import { getUserResumes } from "@/services/resume.service";
import { useResume } from "@/context/ResumeContext";

import ResumeUpload from "./ResumeUpload";
import ResultDashboard from "./ResultDashboard";

export default function ResumeAnalyzer() {
  const {
    resumes,
    setResumes,
    selectedResume,
    setSelectedResume,
    result,
    setResult,
  } = useResume();

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Load Resumes
  // =====================================================

  const loadResumes = useCallback(async () => {
    try {
      const response = await getUserResumes();

      console.log("===== RESUMES RESPONSE =====");
      console.log(response);

      setResumes(response.data);

      if (response.data.length > 0 && !selectedResume) {
        setSelectedResume(response.data[0]);
      }
    } catch (error) {
      console.error("Failed to load resumes:", error);
    }
  }, [selectedResume]);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  // =====================================================
  // Analyze Resume
  // =====================================================

  async function handleAnalyze() {
    if (!selectedResume) {
      alert("Please upload and select a resume.");
      return;
    }

    try {
      setLoading(true);

      console.log("================================");
      console.log("Resume ID:", selectedResume.resume_id);
      console.log("================================");

      const response = await analyzeResume(
        selectedResume.resume_id
      );

      // ================= DEBUG =================

      console.log("FULL RESPONSE");
      console.log(response);

      console.log("RESPONSE.DATA");
      console.log(response.data);

      console.log("ANALYSIS");
      console.log(response.data.analysis);

      // =========================================

      setResult(response.data.analysis);

      setSelectedResume(response.data.resume);
      setResumes((prev) =>
        prev.map((resume) =>
          resume.resume_id === response.data.resume.resume_id
            ? response.data.resume
            : resume
        )
      );
    } catch (error: unknown) {
      console.error("Analysis Error:", error);
      const errRes = (error as { response?: { data?: { message?: string; error?: { message?: string } } } })?.response?.data;
      alert(errRes?.error?.message ?? errRes?.message ?? "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Upload Resume */}
      <ResumeUpload onUploadSuccess={loadResumes} />

      {/* Resume List */}
      {resumes.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-bold">
            Uploaded Resumes
          </h2>

          <div className="space-y-3">
            {resumes.map((resume) => (
              <button
                key={resume.resume_id}
                type="button"
                onClick={() => {
                  setSelectedResume(resume);
                  setResult(null);
                }}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedResume?.resume_id === resume.resume_id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:border-cyan-300"
                }`}
              >
                <p className="font-semibold">
                  {resume.title}
                </p>

                <p className="text-sm text-slate-500">
                  {resume.original_filename}
                </p>

                {resume.ats_score !== null &&
                  resume.ats_score !== undefined && (
                    <p className="mt-2 font-medium text-cyan-600">
                      ATS Score: {resume.ats_score}%
                    </p>
                  )}
              </button>
            ))}
          </div>

        </div>
      )}

      {/* Analyze Button */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !selectedResume}
        className="w-full rounded-xl bg-cyan-600 py-4 font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* Results */}
      {result && <ResultDashboard />}

    </div>
  );
}