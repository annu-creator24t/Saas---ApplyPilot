"use client";

import Link from "next/link";

export default function InterviewPage() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Interview Preparation
        </h1>

        <p className="mt-2 text-slate-500">
          Prepare smarter with AI-generated interview questions
          or practice a complete mock interview.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        <Link
          href="/dashboard/interview/questions"
          className="rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-lg"
        >
          <h2 className="text-2xl font-semibold">
            📚 Interview Questions
          </h2>

          <p className="mt-3 text-slate-500">
            Generate technical, behavioral and HR questions with
            AI-generated ideal answers.
          </p>
        </Link>

        <Link
          href="/dashboard/interview/practice"
          className="rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-lg"
        >
          <h2 className="text-2xl font-semibold">
            🎯 Interview Practice
          </h2>

          <p className="mt-3 text-slate-500">
            Practice interviews, answer questions, receive AI
            evaluation and improve your interview skills.
          </p>
        </Link>

      </div>

    </div>
  );
}