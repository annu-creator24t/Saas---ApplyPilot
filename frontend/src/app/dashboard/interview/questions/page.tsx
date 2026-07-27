"use client";

import { useState } from "react";

import { useResume } from "@/context/ResumeContext";

import { generateInterviewQuestions } from "@/services/interview-questions.service";

export default function InterviewQuestionsPage() {

  const { selectedResume } = useResume();

  const [jobDescription, setJobDescription] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  async function handleGenerate() {

    if (!selectedResume) {

      alert("Please upload a resume first.");

      return;

    }

    try {

      setLoading(true);

      const response =
        await generateInterviewQuestions({

          resume_id:
            selectedResume.resume_id,

          job_description:
            jobDescription,

        });

      setResult(response.data);

    } catch (error) {

      console.error(error);

      alert(
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
          Generate interview questions with ideal answers.
        </p>

      </div>

      <textarea
        rows={8}
        value={jobDescription}
        onChange={(e) =>
          setJobDescription(e.target.value)
        }
        placeholder="Paste Job Description..."
        className="w-full rounded-xl border p-4"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="rounded-xl bg-blue-600 px-6 py-3 text-white"
      >
        {loading
          ? "Generating..."
          : "Generate Questions"}
      </button>

      {result && (

        <div className="space-y-8">

          <QuestionSection
            title="Technical"
            questions={result.technical}
          />

          <QuestionSection
            title="Behavioral"
            questions={result.behavioral}
          />

          <QuestionSection
            title="HR"
            questions={result.hr}
          />

        </div>

      )}

    </div>

  );

}

function QuestionSection({
  title,
  questions,
}: any) {

  return (

    <div>

      <h2 className="mb-4 text-2xl font-semibold">
        {title}
      </h2>

      <div className="space-y-4">

        {questions.map(
          (q: any, index: number) => (

            <div
              key={index}
              className="rounded-xl border p-5"
            >

              <h3 className="font-semibold">

                {index + 1}. {q.question}

              </h3>

              <p className="mt-2 text-sm text-slate-500">

                {q.difficulty}

              </p>

              <details className="mt-4">

                <summary className="cursor-pointer font-medium">

                  Show Ideal Answer

                </summary>

                <p className="mt-3 whitespace-pre-wrap">

                  {q.ideal_answer}

                </p>

              </details>

            </div>

          )
        )}

      </div>

    </div>

  );

}