"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import ThemeToggle from "@/components/common/ThemeToggle";
import { getSubscriptionStatus, SubscriptionStatusData } from "@/services/subscription.service";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FileCheck2,
  Sparkles,
  Mail,
  Mic,
  User,
  LogOut,
  Rocket,
  CreditCard,
  Zap,
  BarChart3,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthContext();
  const [subData, setSubData] = useState<SubscriptionStatusData | null>(null);

  useEffect(() => {
    const fetchSub = async () => {
      try {
        const res = await getSubscriptionStatus();
        if (res?.data) {
          setSubData(res.data);
        }
      } catch (err) {
        // Fallback using user object if profile loaded
      }
    };
    fetchSub();
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isAdmin = (user as any)?.is_admin === true || (user as any)?.role === "admin";

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "ATS Resume Checker", href: "/dashboard/ats-checker", icon: FileCheck2 },
    { label: "Master Resumes", href: "/dashboard/resumes", icon: FileText },
    { label: "AI Job Matcher", href: "/dashboard/resume-optimizer", icon: Sparkles },
    { label: "Applications Tracker", href: "/dashboard/applications", icon: Briefcase },
    { label: "Cover Letter", href: "/dashboard/cover-letter", icon: Mail },
    { label: "Interview Prep AI", href: "/dashboard/interview", icon: Mic },
    { label: "Subscription & Pro", href: "/dashboard/subscription", icon: CreditCard },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    ...(isAdmin
      ? [{ label: "Admin Owner Stats", href: "/dashboard/admin", icon: BarChart3 }]
      : []),
  ];

  const isPro = subData?.is_pro || (user as any)?.subscription_plan === "pro";
  const isTrial = Boolean(subData?.trial_active || (user as any)?.trial_active);
  const trialDaysRemaining = subData?.trial_days_remaining ?? (user as any)?.trial_days_remaining ?? 10;
  const rawRemaining = subData ? subData.free_credits_remaining : Math.max(0, 3 - ((user as any)?.free_usage_count || 0));
  const freeCreditsNum = typeof rawRemaining === "number" ? rawRemaining : 0;

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-xl transition-colors duration-200">
      {/* Brand Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 p-5">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ApplyPilot
              </h1>
              <p className="text-[11px] font-medium text-cyan-600 dark:text-indigo-400">
                AI Career Copilot
              </p>
            </div>
          </Link>

          <ThemeToggle />
        </div>

        {/* AI Usage Credit / Free Trial Banner */}
        <div className="mt-4">
          <Link
            href="/dashboard/subscription"
            className={`block rounded-xl border p-3 transition-all ${
              isPro
                ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                : isTrial
                ? "bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border-cyan-500/30 hover:border-cyan-500/50"
                : freeCreditsNum > 0
                ? "bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40"
                : "bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Zap
                  className={`h-3.5 w-3.5 ${
                    isPro
                      ? "text-emerald-500"
                      : isTrial
                      ? "text-cyan-500"
                      : freeCreditsNum > 0
                      ? "text-indigo-500"
                      : "text-rose-500"
                  }`}
                />
                {isTrial ? "10-Day Free Trial" : "AI Credits"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${
                  isPro
                    ? "bg-emerald-600"
                    : isTrial
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600"
                    : freeCreditsNum > 0
                    ? "bg-indigo-600"
                    : "bg-rose-600"
                }`}
              >
                {isPro
                  ? "PRO ACTIVE"
                  : isTrial
                  ? `${trialDaysRemaining} ${trialDaysRemaining === 1 ? "DAY" : "DAYS"} LEFT`
                  : `${freeCreditsNum} / 3 LEFT`}
              </span>
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 truncate">
                {isPro
                  ? "Unlimited AI access enabled"
                  : isTrial
                  ? `Full Pro access (${trialDaysRemaining} days remaining)`
                  : freeCreditsNum > 0
                  ? `${freeCreditsNum} free AI generations left`
                  : "Limit reached (0/3 remaining)"}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline shrink-0 ml-1">
                {isPro ? "Pro Status" : isTrial ? "Details →" : "Upgrade →"}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-3 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20">
              {user?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                {user?.full_name || "User"}
              </p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
                {user?.email || "Account Active"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}