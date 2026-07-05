type Evaluation = {
  score: number;
  strengths: string[];
  improvements: string[];
  ideal_answer: string;
};

type Props = {
  evaluation: Evaluation | null;
};

export default function EvaluationCard({
  evaluation,
}: Props) {
  if (!evaluation) return null;

  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="flex items-center justify-between">

        <h2 className="text-3xl font-bold">
          🤖 AI Evaluation
        </h2>

        <div className="rounded-full bg-cyan-100 px-6 py-3 text-2xl font-bold text-cyan-700">
          ⭐ {evaluation.score}/10
        </div>

      </div>

      {/* Strengths */}

      <div className="mt-10">

        <h3 className="text-xl font-bold text-green-700">
          ✅ Strengths
        </h3>

        <ul className="mt-4 space-y-3">

          {evaluation.strengths.map(
            (item, index) => (

              <li
                key={index}
                className="rounded-xl bg-green-50 p-4"
              >
                {item}
              </li>

            )
          )}

        </ul>

      </div>

      {/* Improvements */}

      <div className="mt-10">

        <h3 className="text-xl font-bold text-red-700">
          ❌ Improvements
        </h3>

        <ul className="mt-4 space-y-3">

          {evaluation.improvements.map(
            (item, index) => (

              <li
                key={index}
                className="rounded-xl bg-red-50 p-4"
              >
                {item}
              </li>

            )
          )}

        </ul>

      </div>

      {/* Ideal Answer */}

      <div className="mt-10">

        <h3 className="text-xl font-bold text-blue-700">
          💡 Ideal Answer
        </h3>

        <div className="mt-4 rounded-2xl bg-slate-50 p-6 whitespace-pre-line leading-8 text-slate-700">

          {evaluation.ideal_answer}

        </div>

      </div>

    </div>
  );
}