"use client";

import { useResume } from "@/context/ResumeContext";
import CopyButton from "@/components/common/CopyButton";
import { OptimizedProject } from "@/types/resume";

export default function ResumeOptimizerPage() {
  const { result } = useResume();

  if (!result) {
    return (
      <div className="rounded-3xl bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold">
          ✨ Resume Optimizer
        </h1>

        <p className="mt-5 text-slate-500">
          Analyze a resume first from the Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            ✨ Resume Optimizer
          </h1>

          <p className="mt-2 text-slate-500">
            AI-generated improvements for your resume.
          </p>
        </div>

        <span className="rounded-full bg-cyan-100 px-4 py-2 font-semibold text-cyan-700">
          AI Generated
        </span>
      </div>

      {/* Professional Summary */}
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Professional Summary
          </h2>

          <CopyButton text={result.rewritten_summary} />
        </div>

        <div className="mt-6 rounded-xl bg-slate-50 p-6">
          <p className="leading-8 text-slate-700">
            {result.rewritten_summary}
          </p>
        </div>
      </div>

      {/* Projects */}
      <div className="rounded-3xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold">
          Optimized Project Descriptions
        </h2>

        <div className="mt-8 space-y-8">
          {result.optimized_bullet_points?.map(
            (project: OptimizedProject, index: number) => {
              const optimizedText = Array.isArray(project.optimized)
                ? project.optimized.join("\n")
                : project.optimized;

              return (
                <div
                  key={`${project.original}-${index}`}
                  className="rounded-2xl border p-6"
                >
                  <div className="grid gap-8 md:grid-cols-2">
                    {/* Original */}
                    <div>
                      <h3 className="font-bold text-red-600">
                        Original
                      </h3>

                      <div className="mt-4 rounded-xl bg-red-50 p-4">
                        <p className="whitespace-pre-line text-slate-700">
                          {project.original}
                        </p>
                      </div>
                    </div>

                    {/* Optimized */}
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-green-600">
                          AI Optimized
                        </h3>

                        <CopyButton text={optimizedText} />
                      </div>

                      <div className="mt-4 rounded-xl bg-green-50 p-4">
                        {Array.isArray(project.optimized) ? (
                          <ul className="list-disc space-y-3 pl-6">
                            {project.optimized.map(
                              (bullet: string, i: number) => (
                                <li key={i}>{bullet}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p>{project.optimized}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}