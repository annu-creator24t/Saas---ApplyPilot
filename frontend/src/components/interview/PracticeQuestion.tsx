import { PracticeQuestion } from "@/types/interview-practice";

interface Props {
  question: PracticeQuestion;
  answer: string;
  setAnswer: (
    value: string
  ) => void;
}

export default function PracticeQuestion({
  question,
  answer,
  setAnswer,
}: Props) {

  return (

    <div className="rounded-2xl border bg-white p-8">

      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">

        {question.category}

      </span>

      <h2 className="mt-5 text-2xl font-semibold">

        {question.question}

      </h2>

      <p className="mt-2 text-sm text-slate-500">

        Difficulty:
        {" "}
        {question.difficulty}

      </p>

      <textarea
        rows={10}
        value={answer}
        onChange={(e)=>
          setAnswer(e.target.value)
        }
        placeholder="Write your answer..."
        className="mt-6 w-full rounded-xl border p-4"
      />

    </div>

  );

}