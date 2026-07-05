type Props = {
  seconds: number;
  onGenerate: () => void;
  loading: boolean;
};

export default function InterviewHeader({
  seconds,
  onGenerate,
  loading,
}: Props) {
  return (
    <div className="flex items-center justify-between">

      <div>

        <h1 className="text-4xl font-bold">
          🎤 AI Interview Simulator
        </h1>

        <p className="mt-2 text-slate-500">
          Practice role-specific interview questions generated from your resume.
        </p>

      </div>

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-yellow-100 px-5 py-3 font-semibold">

          ⏱ {Math.floor(seconds / 60)}m {seconds % 60}s

        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white hover:bg-cyan-700"
        >
          {loading
            ? "Generating..."
            : "Generate Questions"}
        </button>

      </div>

    </div>
  );
}