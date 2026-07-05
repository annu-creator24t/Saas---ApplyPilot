type Props = {
  answer: string;
  setAnswer: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export default function AnswerBox({
  answer,
  setAnswer,
  onSubmit,
  loading,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-8 shadow-lg">

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Your Answer
        </h2>

        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
          {answer.length} characters
        </span>

      </div>

      <textarea
        rows={10}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your interview answer here..."
        className="w-full rounded-2xl border border-slate-300 p-5 text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
      />

      <div className="mt-6 flex justify-end">

        <button
          onClick={onSubmit}
          disabled={loading || !answer.trim()}
          className="rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Evaluating..." : "Submit Answer"}
        </button>

      </div>

    </div>
  );
}