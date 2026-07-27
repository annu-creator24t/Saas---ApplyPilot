"use client";

import { useEffect, useState } from "react";

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

  // Load resumes from backend
  async function loadResumes() {
    try {
      const response = await getUserResumes();

      setResumes(response.data);

      if (response.data.length > 0 && !selectedResume) {
        setSelectedResume(response.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadResumes();
  }, []);

  async function handleAnalyze() {
    if (!selectedResume) {
      alert("Please upload and select a resume.");
      return;
    }

    try {
      setLoading(true);

      const response = await analyzeResume(
        selectedResume.resume_id
      );

      setResult(response.data.analysis);

      setSelectedResume(response.data.resume);

      setResumes((prev) =>
        prev.map((resume) =>
          resume.resume_id === response.data.resume.resume_id
            ? response.data.resume
            : resume
        )
      );
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ??
          "Analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* Upload */}
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
                onClick={() => setSelectedResume(resume)}
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

                {resume.ats_score !== null && (
                  <p className="mt-2 text-cyan-600 font-medium">
                    ATS Score: {resume.ats_score}%
                  </p>
                )}
              </button>
            ))}

          </div>
        </div>
      )}

      {/* Analyze */}
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !selectedResume}
        className="w-full rounded-xl bg-cyan-600 py-4 font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {/* Result */}
      {result && <ResultDashboard />}

    </div>
  );
}