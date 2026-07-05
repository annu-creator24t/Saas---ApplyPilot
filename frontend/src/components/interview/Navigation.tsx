type Props = {
  current: number;
  total: number;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export default function Navigation({
  current,
  total,
  canGoNext,
  onPrevious,
  onNext,
}: Props) {
  return (
    <div className="flex items-center justify-between">

      <button
        onClick={onPrevious}
        disabled={current === 0}
        className="rounded-xl bg-slate-200 px-6 py-3 font-semibold transition hover:bg-slate-300 disabled:opacity-50"
      >
        ← Previous
      </button>

      <button
        onClick={onNext}
        disabled={!canGoNext || current === total - 1}
        className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:bg-slate-400"
      >
        Next →
      </button>

    </div>
  );
}