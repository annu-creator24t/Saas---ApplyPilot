"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import { ArrowRight, Lock, Mail, AlertCircle, Loader2, Rocket, Eye, EyeOff, CheckCircle2 } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessBanner("🎉 Account created successfully! Please sign in with your email and password.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await login(email.trim().toLowerCase(), password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { error?: { message?: string }; message?: string } } })?.response?.data;
      setError(
        errData?.error?.message ||
          errData?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6">
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 mb-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md">
            <Rocket className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Apply<span className="text-cyan-600 dark:text-cyan-400">Pilot</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to manage your AI job applications</p>
      </div>

      {successBanner && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-indigo-400" /> Email Address
          </label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-indigo-400" /> Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 dark:text-cyan-400 hover:underline transition"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 pr-10 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 cursor-pointer transition focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Logging in...
            </>
          ) : (
            <>
              Sign In <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-blue-600 dark:text-cyan-400 hover:underline font-bold transition">
          Create Account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 py-12 transition-colors duration-200">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <Suspense fallback={
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}