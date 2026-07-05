export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        <h1 className="text-2xl font-bold text-cyan-400">
          ApplyPilot AI
        </h1>

        <div className="flex gap-8 text-slate-300">
          <a href="#">Features</a>
          <a href="#">How it Works</a>
          <a href="#">Pricing</a>
        </div>

        <button className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black hover:bg-cyan-400 transition">
          Login
        </button>

      </div>
    </nav>
  );
}