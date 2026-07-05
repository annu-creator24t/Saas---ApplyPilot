import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-900 text-white">

      {/* Logo */}

      <div className="border-b border-slate-800 p-8">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-2xl">
            🚀
          </div>

          <div>

            <h1 className="text-2xl font-extrabold text-cyan-400">
              ApplyPilot
            </h1>

            <p className="text-sm text-slate-400">
              AI Career Assistant
            </p>

          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-3 p-6">

        <Link
          href="/dashboard"
          className="block rounded-xl bg-cyan-600 px-5 py-3 font-semibold transition hover:bg-cyan-500"
        >
          🏠 Dashboard
        </Link>

        <Link
          href="/dashboard/resume-optimizer"
          className="block rounded-xl px-5 py-3 transition hover:bg-slate-800"
        >
          ✨ Resume Optimizer
        </Link>

        <Link
          href="/dashboard/cover-letter"
          className="block rounded-xl px-5 py-3 transition hover:bg-slate-800"
        >
          📄 Cover Letter
        </Link>

        <Link
          href="/dashboard/interview"
          className="block rounded-xl px-5 py-3 transition hover:bg-slate-800"
        >
          🎤 Interview Prep
        </Link>

        <Link
          href="/dashboard/profile"
          className="block rounded-xl px-5 py-3 transition hover:bg-slate-800"
        >
          👤 Profile
        </Link>

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-6">

        <div className="rounded-xl bg-slate-800 p-4">

          <p className="text-sm font-semibold text-cyan-400">
            ApplyPilot AI
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Version 1.0.0
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Powered by Gemini AI & FastAPI
          </p>

        </div>

      </div>

    </aside>
  );
}