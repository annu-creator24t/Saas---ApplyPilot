"use client";

import { useResume } from "@/context/ResumeContext";

export default function ResultDashboard() {
  const { result } = useResume();

  if (!result) return null;

  const progress = Math.min(
    Math.max(result.ats_score, 0),
    100
  );

  return (
    <div className="mt-8 space-y-8">

      {/* ATS Score */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-500">
          ATS Score
        </h2>

        <p className="mt-4 text-5xl font-bold text-cyan-600">
          {result.ats_score}%
        </p>

        <div className="mt-6 h-3 rounded-full bg-slate-200">
          <div
            className="h-3 rounded-full bg-cyan-600 transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">
          📝 Summary
        </h2>

        <p className="leading-8 text-slate-700">
          {result.summary}
        </p>
      </div>

      {/* Strengths */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">
          ✅ Strengths
        </h2>

        {result.strengths?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {result.strengths.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-green-200 bg-green-50 p-4"
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">
            No strengths found.
          </p>
        )}
      </div>

      {/* Weaknesses */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">
          ⚠️ Weaknesses
        </h2>

        {result.weaknesses?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {result.weaknesses.map((item, index) => (
              <div
                key={index}
                className="rounded-lg border border-red-200 bg-red-50 p-4"
              >
                {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">
            No weaknesses found.
          </p>
        )}
      </div>

      {/* Missing Skills */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">
          🚀 Missing Skills
        </h2>

        {result.missing_skills?.length ? (
          <div className="flex flex-wrap gap-3">
            {result.missing_skills.map((skill, index) => (
              <span
                key={index}
                className="rounded-full bg-orange-100 px-4 py-2 text-orange-700"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">
            No missing skills found.
          </p>
        )}
      </div>

      {/* Grammar */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">
          ✍️ Grammar
        </h2>

        <p className="text-slate-700">
          {result.grammar}
        </p>
      </div>

      {/* Formatting */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold">
          📄 Formatting
        </h2>

        <p className="text-slate-700">
          {result.formatting}
        </p>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">
          💡 Recommendations
        </h2>

        {result.recommendations?.length ? (
          <ul className="space-y-3">
            {result.recommendations.map((item, index) => (
              <li
                key={index}
                className="rounded-lg bg-slate-100 p-4"
              >
                • {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">
            No recommendations available.
          </p>
        )}
      </div>

    </div>
  );
}