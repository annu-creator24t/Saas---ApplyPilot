"use client";

import { useState } from "react";
import { InterviewQuestion } from "@/types/interview-questions";

interface Props {
  question: InterviewQuestion;
}

export default function QuestionCard({ question }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-700">
          {question.category}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
          {question.difficulty}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        {question.question}
      </h3>

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="mt-4 text-cyan-600 font-medium hover:underline"
      >
        {showAnswer ? "Hide Ideal Answer" : "Show Ideal Answer"}
      </button>

      {showAnswer && (
        <div className="mt-4 rounded-lg bg-slate-50 p-4">
          {question.ideal_answer}
        </div>
      )}
    </div>
  );
}