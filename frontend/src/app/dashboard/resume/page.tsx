"use client";

import { useEffect } from "react";

import ResumeUpload from "@/components/resume/ResumeUpload";
import ResumeAnalyzer from "@/components/resume/ResumeAnalyzer";

import { useResume } from "@/context/ResumeContext";
import { getUserResumes } from "@/services/resume.service";

export default function ResumePage() {
  const {
    resumes,
    setResumes,
    selectedResume,
    setSelectedResume,
  } = useResume();

  useEffect(() => {
    loadResumes();
  }, []);

  async function loadResumes() {
    try {
      const response = await getUserResumes();

      setResumes(response.data);

      if (response.data.length > 0) {
        setSelectedResume(response.data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-8">

      <div>
        <h1 className="text-4xl font-bold">
          Resume Analyzer
        </h1>

        <p className="mt-2 text-slate-600">
          Upload your resume and get an ATS analysis powered by AI.
        </p>
      </div>

      <ResumeUpload onUploadSuccess={loadResumes} />

      {resumes.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-semibold">
            Uploaded Resumes
          </h2>

          <div className="space-y-3">

            {resumes.map((resume) => (
              <button
                key={resume.resume_id}
                onClick={() => setSelectedResume(resume)}
                className={`w-full rounded-lg border p-4 text-left transition ${
                  selectedResume?.resume_id === resume.resume_id
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <p className="font-semibold">
                  {resume.title}
                </p>

                <p className="text-sm text-slate-500">
                  ATS Score:{" "}
                  {resume.ats_score ?? "--"}
                </p>
              </button>
            ))}

          </div>

        </div>
      )}

      <ResumeAnalyzer />

    </div>
  );
}