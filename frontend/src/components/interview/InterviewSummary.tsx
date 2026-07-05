type Props = {
  totalQuestions: number;
  averageScore: number;
  duration: number;
};

export default function InterviewSummary({
  totalQuestions,
  averageScore,
  duration,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">

      <h2 className="text-3xl font-bold">
        🎉 Interview Completed
      </h2>

      <div className="mt-8 grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl bg-cyan-50 p-6">

          <h3 className="font-semibold text-slate-600">
            Questions
          </h3>

          <p className="mt-3 text-4xl font-bold">
            {totalQuestions}
          </p>

        </div>

        <div className="rounded-2xl bg-green-50 p-6">

          <h3 className="font-semibold text-slate-600">
            Average Score
          </h3>

          <p className="mt-3 text-4xl font-bold">
            {averageScore.toFixed(1)}/10
          </p>

        </div>

        <div className="rounded-2xl bg-yellow-50 p-6">

          <h3 className="font-semibold text-slate-600">
            Duration
          </h3>

          <p className="mt-3 text-4xl font-bold">
            {Math.floor(duration / 60)}m {duration % 60}s
          </p>

        </div>

      </div>

    </div>
  );
}