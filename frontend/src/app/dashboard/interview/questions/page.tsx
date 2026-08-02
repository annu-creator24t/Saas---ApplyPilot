"use client";

import { useState } from "react";

import { useResume } from "@/context/ResumeContext";

import { generateInterviewQuestions } from "@/services/interview-questions.service";

import {
  InterviewQuestion,
  InterviewQuestionsResponse,
} from "@/types/interview-questions";

export default function InterviewQuestionsPage() {
  const { selectedResume } = useResume();

  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState<InterviewQuestionsResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

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

      const response =
        await generateInterviewQuestions({
          resume_id:
            selectedResume.resume_id,
          job_description: jobDescription,
        });

      setResult(response.data);
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ??
          "Failed to generate interview questions."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Interview Questions
        </h1>

        <p className="mt-2 text-slate-500">
          Generate personalized technical,
          behavioral, and HR interview
          questions from your resume.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">

        <label className="mb-2 block font-medium">
          Job Description
        </label>

        <textarea
          rows={8}
          value={jobDescription}
          onChange={(e) =>
            setJobDescription(
              e.target.value
            )
          }
          placeholder="Paste the Job Description here..."
          className="w-full rounded-xl border p-4 outline-none focus:border-blue-500"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="mt-5 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Generating..."
            : "Generate Questions"}
        </button>

      </div>

      {result && (
        <div className="space-y-10">

          <QuestionSection
            title="Technical Questions"
            questions={result.technical}
          />

          <QuestionSection
            title="Behavioral Questions"
            questions={result.behavioral}
          />

          <QuestionSection
            title="HR Questions"
            questions={result.hr}
          />

        </div>
      )}

    </div>
  );
}

interface QuestionSectionProps {
  title: string;
  questions: InterviewQuestion[];
}

function QuestionSection({
  title,
  questions,
}: QuestionSectionProps) {
  if (!questions.length) {
    return (
      <div>
        <h2 className="mb-4 text-2xl font-bold">
          {title}
        </h2>

        <p className="text-slate-500">
          No questions generated.
        </p>
      </div>
    );
  }

  return (
    <div>

      <h2 className="mb-5 text-2xl font-bold">
        {title}
      </h2>

      <div className="space-y-5">

        {questions.map(
          (
            question,
            index
          ) => (
            <div
              key={index}
              className="rounded-2xl border bg-white p-6 shadow-sm"
            >

              <h3 className="text-lg font-semibold">
                {index + 1}.{" "}
                {question.question}
              </h3>

              <div className="mt-4 flex gap-3">

                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                  {question.category}
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {question.difficulty}
                </span>

              </div>

              <details className="mt-5">

                <summary className="cursor-pointer font-medium text-blue-600">
                  Show Ideal Answer
                </summary>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 whitespace-pre-wrap leading-7">
                  {question.ideal_answer}
                </div>

              </details>

            </div>
          )
        )}

      </div>

    </div>
  );
}