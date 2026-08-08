"use client";

import Link from "next/link";
import ThemeToggle from "@/components/common/ThemeToggle";
import { Rocket } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Apply<span className="text-cyan-600 dark:text-cyan-400">Pilot</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/#features" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            Features
          </Link>
          <Link href="/dashboard/ats-checker" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            ATS Checker
          </Link>
          <Link href="/dashboard/subscription" className="hover:text-cyan-600 dark:hover:text-cyan-400 transition">
            Pricing (₹99/mo)
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/login"
            className="rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Sign In
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:opacity-90 transition"
          >
            Launch Copilot →
          </Link>
        </div>
      </div>
    </nav>
  );
}