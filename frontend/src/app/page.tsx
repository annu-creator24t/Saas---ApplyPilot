"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 px-6">
      <div className="max-w-3xl text-center text-white">
        <h1 className="text-6xl font-extrabold">
          ApplyPilot AI
        </h1>

        <p className="mt-6 text-xl text-cyan-100">
          Analyze resumes, improve ATS scores, optimize resumes,
          generate interview questions, practice interviews,
          and prepare for your dream job using AI.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-cyan-700 transition hover:scale-105"
          >
            Launch Dashboard →
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-white px-8 py-4 text-lg font-bold text-white transition hover:bg-white hover:text-cyan-700"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}