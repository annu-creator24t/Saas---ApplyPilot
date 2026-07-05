"use client";

import { useResume } from "@/context/ResumeContext";

export default function ResultDashboard() {
  const { result } = useResume();

  if (!result) return null;

  return (
    <div className="mt-10 space-y-8">

      {/* Score Cards */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* ATS Score */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          <h2 className="text-lg font-semibold text-slate-500">
            ATS Score
          </h2>

          <p className="mt-4 text-5xl font-extrabold text-cyan-600">
            {result.ats_score}%
          </p>

          <div className="mt-6 h-3 rounded-full bg-slate-200">

            <div
              className="h-3 rounded-full bg-cyan-600 transition-all duration-1000"
              style={{
                width: `${result.ats_score}%`,
              }}
            />

          </div>

        </div>

        {/* Match Score */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">

          <h2 className="text-lg font-semibold text-slate-500">
            Match Score
          </h2>

          <p className="mt-4 text-5xl font-extrabold text-green-600">
            {result.match_score}%
          </p>

          <div className="mt-6 h-3 rounded-full bg-slate-200">

            <div
              className="h-3 rounded-full bg-green-600 transition-all duration-1000"
              style={{
                width: `${result.match_score}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* Strengths */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">

        <h2 className="mb-6 text-2xl font-bold">
          💪 Strengths
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          {result.strengths?.map((item: string, index: number) => (
            <div
              key={index}
              className="rounded-xl border border-green-200 bg-green-50 p-4"
            >
              ✅ {item}
            </div>
          ))}

        </div>

      </div>

      {/* Missing Skills */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">

        <h2 className="mb-6 text-2xl font-bold">
          ❌ Missing Skills
        </h2>

        <div className="flex flex-wrap gap-3">

          {result.missing_skills?.map((skill: string, index: number) => (
            <span
              key={index}
              className="rounded-full bg-red-100 px-4 py-2 font-medium text-red-700"
            >
              {skill}
            </span>
          ))}

        </div>

      </div>

      {/* Resume Suggestions */}
      <div className="rounded-2xl bg-white p-8 shadow-lg">

        <h2 className="mb-6 text-2xl font-bold">
          💡 Resume Suggestions
        </h2>

        <ul className="space-y-3">

          {result.resume_suggestions?.map((item: string, index: number) => (
            <li
              key={index}
              className="rounded-lg bg-slate-50 p-4"
            >
              {item}
            </li>
          ))}

        </ul>

      </div>

      {/* Interview Questions */}

<div className="rounded-2xl bg-white p-8 shadow-lg">

  <h2 className="mb-6 text-2xl font-bold">
    🎯 Interview Questions
  </h2>

  <div className="space-y-6">

    {result.interview_questions?.map(
      (item: any, index: number) => (

        <div
          key={index}
          className="rounded-xl border border-slate-200 p-5"
        >

          <div className="flex items-center justify-between">

            <h3 className="font-semibold text-lg">
              {item.question}
            </h3>

            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                item.difficulty === "Easy"
                  ? "bg-green-100 text-green-700"
                  : item.difficulty === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {item.difficulty}
            </span>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">

            {item.expected_topics?.map(
              (topic: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-700"
                >
                  {topic}
                </span>
              )
            )}

          </div>

        </div>

      )
    )}

  </div>

</div>

    

    </div>
  );
}