const buttons = [
  "Analyze Resume",
  "Tailor Resume",
  "Cover Letter",
  "Interview Questions",
];

export default function ActionButtons() {
  return (
    <div className="mt-6 space-y-3">
      {buttons.map((button) => (
        <button
          key={button}
          className="w-full rounded-xl border py-3 font-semibold hover:bg-slate-100 transition"
        >
          {button}
        </button>
      ))}
    </div>
  );
}