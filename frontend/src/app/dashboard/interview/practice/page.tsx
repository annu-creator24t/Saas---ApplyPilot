"use client";

import { useState } from "react";

import { useResume } from "@/context/ResumeContext";

import {
  startInterviewPractice,
  evaluateAnswer,
} from "@/services/interview-practice.service";

import PracticeQuestion from "@/components/interview/PracticeQuestion";
import EvaluationCard from "@/components/interview/EvaluationCard";
import InterviewSummary from "@/components/interview/InterviewSummary";

import {
  PracticeQuestion as Question,
  Evaluation,
} from "@/types/interview-practice";

export default function InterviewPracticePage() {
  const { selectedResume } = useResume();

  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] =
    useState<Evaluation | null>(null);

  const [results, setResults] =
    useState<Evaluation[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  async function handleStart() {
    if (!selectedResume) {
      alert("Please upload and select a resume.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await startInterviewPractice({
          resume_id: selectedResume.resume_id,
          job_description: jobDescription,
        });

      setQuestions(response.data.questions);

      setCurrent(0);
      setAnswer("");
      setEvaluation(null);
      setResults([]);
      setCompleted(false);
    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ??
          "Failed to start interview."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleEvaluate() {
    if (!answer.trim()) {
      alert("Answer cannot be empty.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await evaluateAnswer({
          question:
            questions[current].question,
          answer,
        });

      setEvaluation(response.data);

      setResults((prev) => {
        const copy = [...prev];
        copy[current] = response.data;
        return copy;
      });

    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ??
          "Evaluation failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (current === questions.length - 1) {
      setCompleted(true);
      return;
    }

    setCurrent((prev) => prev + 1);
    setAnswer("");
    setEvaluation(null);
  }

  if (completed) {
    return (
      <InterviewSummary
        results={results}
      />
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">

      <div className="rounded-2xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">
          🎤 AI Interview Practice
        </h1>

        {selectedResume && (
          <p className="mt-3 text-slate-600">
            Resume: <b>{selectedResume.title}</b>
          </p>
        )}
      </div>

      {questions.length === 0 && (
        <div className="rounded-2xl bg-white p-8 shadow">

          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) =>
              setJobDescription(
                e.target.value
              )
            }
            placeholder="Paste Job Description..."
            className="w-full rounded-xl border p-4"
          />

          <button
            onClick={handleStart}
            disabled={loading}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
          >
            {loading
              ? "Generating..."
              : "Start Interview"}
          </button>

        </div>
      )}

      {questions.length > 0 && !completed && (
        <>
          <PracticeQuestion
            question={questions[current]}
            answer={answer}
            setAnswer={setAnswer}
          />

          {!evaluation && (
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="rounded-xl bg-green-600 px-6 py-3 text-white disabled:opacity-50"
            >
              {loading
                ? "Evaluating..."
                : "Evaluate Answer"}
            </button>
          )}

          {evaluation && (
            <>
              <EvaluationCard
                evaluation={evaluation}
              />

              <button
                onClick={nextQuestion}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white"
              >
                {current === questions.length - 1
                  ? "Finish Interview"
                  : "Next Question"}
              </button>
            </>
          )}
        </>
      )}

    </div>
  );
}