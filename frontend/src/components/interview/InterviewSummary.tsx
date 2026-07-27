import { Evaluation } from "@/types/interview-practice";

interface Props {
  results: Evaluation[];
}

export default function InterviewSummary({
  results,
}: Props) {

  const average =
    results.length === 0
      ? 0
      : (
          results.reduce(
            (sum, r) =>
              sum + r.score,
            0
          ) / results.length
        ).toFixed(1);

  return (

    <div className="rounded-2xl border bg-white p-10">

      <h1 className="text-3xl font-bold">

        Interview Completed 🎉

      </h1>

      <h2 className="mt-8 text-5xl font-bold">

        {average}/10

      </h2>

      <p className="mt-3 text-slate-500">

        Overall Interview Score

      </p>

    </div>

  );

}