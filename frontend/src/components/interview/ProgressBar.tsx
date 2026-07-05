type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({
  current,
  total,
}: Props) {
  const percentage =
    total === 0 ? 0 : (current / total) * 100;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">

      <div className="mb-4 flex items-center justify-between">

        <span className="font-semibold text-slate-700">
          Question {current} of {total}
        </span>

        <span className="font-semibold text-cyan-600">
          {Math.round(percentage)}%
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-cyan-600 transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}