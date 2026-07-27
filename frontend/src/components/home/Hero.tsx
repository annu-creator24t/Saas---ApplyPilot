export default function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">

      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
        AI Internship Application Copilot
      </span>

      <h1 className="mt-8 text-6xl font-extrabold leading-tight">
        Land More Interviews
        <br />
        <span className="text-cyan-400">
          with AI
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-slate-300">
        Upload your resume, compare it with any job description,
        optimize it for ATS, generate personalized cover letters,
        and prepare for interviews in minutes.
      </p>

      <div className="mt-10 flex gap-4">

        <button className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black">
          Get Started
        </button>

        <button className="rounded-xl border border-slate-700 px-6 py-3">
          Watch Demo
        </button>

      </div>

    </section>
  );
}