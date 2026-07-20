interface Props {
  score: number;
}

export default function ATSCard({ score }: Props) {
  return (
    <div className="mt-5 rounded-2xl bg-white shadow-lg p-5 flex justify-between items-center">
      <h3 className="font-semibold">ATS Match</h3>

      <span className="text-3xl font-bold text-green-600">
        {score}%
      </span>
    </div>
  );
}