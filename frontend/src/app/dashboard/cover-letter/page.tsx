"use client";

import { useState } from "react";
import { useResume } from "@/context/ResumeContext";
import { generateCoverLetter } from "@/services/coverLetter";

export default function CoverLetterPage() {
  const { resumeText, jobDescription } = useResume();

  console.log("Resume Context:", resumeText);
console.log("Job Description Context:", jobDescription);

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!resumeText) {
      alert("Please analyze your resume first.");
      return;
    }

    try {
      setLoading(true);

      const data = await generateCoverLetter(
        resumeText,
        jobDescription
      );

      setCoverLetter(data.cover_letter);

    } catch (err) {
      console.error(err);
      alert("Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold">
          📄 AI Cover Letter
        </h1>

        <p className="mt-2 text-slate-500">
          Generate a personalized cover letter using your analyzed resume.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Cover Letter
          </h2>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700 disabled:bg-slate-400"
          >
            {loading
              ? "Generating..."
              : "Generate Cover Letter"}
          </button>

        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-6 min-h-[300px] whitespace-pre-line">

          {coverLetter ? (
            coverLetter
          ) : (
            <span className="text-slate-500">
              Click <b>Generate Cover Letter</b> to generate an AI-powered cover letter.
            </span>
          )}

        </div>

      </div>

    </div>
  );
}