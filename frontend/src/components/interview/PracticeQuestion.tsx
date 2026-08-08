import type { PracticeQuestion as PracticeQuestionData } from "@/types/interview-practice";

interface Props {
  question: PracticeQuestionData;
  answer: string;
  setAnswer: (value: string) => void;
}

export default function PracticeQuestion({
  question,
  answer,
  setAnswer,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
          {question.category}
        </span>
        <span className="text-xs text-slate-400">
          Difficulty: <span className="font-semibold text-slate-200">{question.difficulty}</span>
        </span>
      </div>

      <h2 className="text-base font-bold text-white leading-relaxed">
        {question.question}
      </h2>

      <textarea
        rows={8}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Write your response using the STAR method (Situation, Task, Action, Result)..."
        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition leading-relaxed"
      />
    </div>
  );
}