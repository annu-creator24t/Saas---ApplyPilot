"use client";

import { useState } from "react";

import { useResume } from "@/context/ResumeContext";
import { generateCoverLetter } from "@/services/coverLetter.service";
import CopyButton from "@/components/common/CopyButton";

export default function CoverLetterPage() {
  const { selectedResume } = useResume();

  const [jobDescription, setJobDescription] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!selectedResume) {
      alert("Please upload and select a resume first.");
      return;
    }

    if (!jobDescription.trim()) {
      alert("Please enter a job description.");
      return;
    }

    try {
      setLoading(true);

      const response = await generateCoverLetter({
        resume_id: selectedResume.resume_id,
        job_description: jobDescription,
      });

      setCoverLetter(response.data.cover_letter);
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ??
          "Failed to generate cover letter."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">

      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-4xl font-bold">
          📄 Cover Letter Generator
        </h1>

        <p className="mt-2 text-slate-600">
          Generate a personalized AI-powered cover letter using your resume.
        </p>

        {selectedResume ? (
          <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="font-semibold">
              Selected Resume
            </p>

            <p className="mt-1 text-slate-700">
              {selectedResume.title}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-yellow-700">
            No resume selected.
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Job Description
        </h2>

        <textarea
          value={jobDescription}
          onChange={(e) =>
            setJobDescription(e.target.value)
          }
          rows={10}
          placeholder="Paste the job description here..."
          className="w-full rounded-lg border border-slate-300 p-4 outline-none focus:border-cyan-500"
        />
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !selectedResume}
        className="w-full rounded-xl bg-cyan-600 py-4 font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Generating..."
          : "Generate Cover Letter"}
      </button>

      <div className="rounded-2xl bg-white p-8 shadow">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Generated Cover Letter
          </h2>

          {coverLetter && (
            <CopyButton text={coverLetter} />
          )}
        </div>

        <div className="min-h-[350px] whitespace-pre-wrap rounded-xl bg-slate-50 p-6 leading-8">

          {coverLetter ? (
            coverLetter
          ) : (
            <p className="text-slate-500">
              Your generated cover letter will appear here.
            </p>
          )}

        </div>

      </div>

    </div>
  );
}