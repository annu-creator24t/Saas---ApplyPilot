"use client";

import { useState } from "react";
import { InterviewQuestion } from "@/types/interview-questions";
import { ChevronDown } from "lucide-react";

interface Props {
  question: InterviewQuestion;
}

export default function QuestionCard({ question }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
          {question.category}
        </span>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
          {question.difficulty}
        </span>
      </div>

      <h3 className="text-xs font-semibold text-slate-100 leading-relaxed">
        {question.question}
      </h3>

      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
      >
        {showAnswer ? "Hide Ideal Answer" : "Show Ideal Answer"}
        <ChevronDown className={`h-3.5 w-3.5 transition ${showAnswer ? "rotate-180" : ""}`} />
      </button>

      {showAnswer && (
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300">
          {question.ideal_answer}
        </div>
      )}
    </div>
  );
}