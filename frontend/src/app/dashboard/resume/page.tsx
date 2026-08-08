"use client";

import ResumeSelector from "@/components/resume/ResumeSelector";
import ResumeAnalyzer from "@/components/resume/ResumeAnalyzer";
import { useResume } from "@/context/ResumeContext";

export default function ResumePage() {
  const { resumes } = useResume();

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Resume Analyzer & Management
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-400">
          Upload, manage, and analyze your master resume with AI.
        </p>
      </div>

      <ResumeSelector
        title="Master Resume"
        subtitle="Selected resume will be evaluated below."
      />

      {resumes.length > 0 && <ResumeAnalyzer />}
    </div>
  );
}