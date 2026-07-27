"use client";

import { Evaluation } from "@/types/interview-practice";

interface EvaluationCardProps {
  evaluation: Evaluation;
}

export default function EvaluationCard({
  evaluation,
}: EvaluationCardProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow space-y-8">

      <div>
        <h2 className="text-2xl font-bold">
          🎯 Score
        </h2>

        <p className="mt-3 text-5xl font-bold text-blue-600">
          {evaluation.score}/10
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold text-green-600">
          Strengths
        </h2>

        <ul className="space-y-2">
          {evaluation.strengths?.map((item, index) => (
            <li
              key={index}
              className="rounded-lg bg-green-50 p-3"
            >
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold text-red-600">
          Improvements
        </h2>

        <ul className="space-y-2">
          {evaluation.improvements?.map((item, index) => (
            <li
              key={index}
              className="rounded-lg bg-red-50 p-3"
            >
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-bold text-cyan-600">
          Ideal Answer
        </h2>

        <div className="rounded-xl bg-slate-100 p-5 whitespace-pre-wrap leading-7">
          {evaluation.ideal_answer}
        </div>
      </div>

    </div>
  );
}