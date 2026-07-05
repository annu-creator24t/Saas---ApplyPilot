type Question = {
  category: string;
  difficulty: string;
  question: string;
};

type Props = {
  question: Question;
  current: number;
  total: number;
};

export default function QuestionCard({
  question,
  current,
  total,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-6 flex items-center justify-between">

        <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
          {question.category}
        </span>

        <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
          {question.difficulty}
        </span>

      </div>

      <p className="mb-3 text-sm font-medium text-slate-500">
        Question {current} of {total}
      </p>

      <h2 className="text-2xl font-bold leading-10 text-slate-800">
        {question.question}
      </h2>

    </div>
  );
}