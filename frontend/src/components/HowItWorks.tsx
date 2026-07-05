const steps = [
  "Upload Your Resume",
  "Paste the Job Description",
  "AI Analyzes Your Profile",
  "Receive ATS Score & Recommendations",
];

export default function HowItWorks() {
  return (
    <section className="bg-slate-900 py-24">
      <div className="mx-auto max-w-5xl px-6">

        <h2 className="mb-16 text-center text-4xl font-bold">
          How It Works
        </h2>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-6 rounded-xl border border-slate-800 p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">
                {index + 1}
              </div>

              <h3 className="text-xl">
                {step}
              </h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}