"use client";

import { Evaluation } from "@/types/interview-practice";
import { Award, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface EvaluationCardProps {
  evaluation: Evaluation;
}

export default function EvaluationCard({ evaluation }: EvaluationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {/* Score Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Answer Score</span>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" /> Evaluation
          </h2>
        </div>
        <div className="text-3xl font-extrabold text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-2xl border border-indigo-500/20">
          {evaluation.score}<span className="text-sm font-normal text-slate-400">/10</span>
        </div>
      </div>

      {/* Strengths */}
      {evaluation.strengths && evaluation.strengths.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Key Strengths
          </h3>
          <div className="space-y-1.5">
            {evaluation.strengths.map((item, index) => (
              <div key={index} className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-300">
                • {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements && evaluation.improvements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Recommended Improvements
          </h3>
          <div className="space-y-1.5">
            {evaluation.improvements.map((item, index) => (
              <div key={index} className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                • {item}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ideal Answer */}
      {evaluation.ideal_answer && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" /> Suggested Ideal Response
          </h3>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
            {evaluation.ideal_answer}
          </div>
        </div>
      )}
    </div>
  );
}