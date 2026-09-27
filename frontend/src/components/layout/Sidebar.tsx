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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
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

  // Close mobile drawer on route change
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    if (onClose) onClose();
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

  const sidebarContent = (
    <aside className="flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 shadow-xl transition-colors duration-200">
      {/* Brand Header */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            onClick={() => onClose && onClose()}
            className="flex items-center gap-3 group"
          >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                ApplyPilot
              </h1>
              <p className="text-[10px] sm:text-[11px] font-medium text-cyan-600 dark:text-indigo-400">
                AI Career Copilot
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close menu"
              >
                <span className="text-lg font-bold leading-none">&times;</span>
              </button>
            )}
          </div>
        </div>

        {/* AI Usage Credit / Free Trial Banner */}
        <div className="mt-3 sm:mt-4">
          <Link
            href="/dashboard/subscription"
            onClick={() => onClose && onClose()}
            className={`block rounded-xl border p-2.5 sm:p-3 transition-all ${
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

            <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 truncate">
                {isPro
                  ? "Unlimited AI enabled"
                  : isTrial
                  ? `Pro access (${trialDaysRemaining}d left)`
                  : freeCreditsNum > 0
                  ? `${freeCreditsNum} free AI left`
                  : "Limit reached (0/3)"}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline shrink-0 ml-1">
                {isPro ? "Status" : isTrial ? "Details →" : "Upgrade →"}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 p-2.5 sm:p-3 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
              onClick={() => onClose && onClose()}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1"
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
      <div className="border-t border-slate-200 dark:border-slate-800/80 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20">
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
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Screens >= 768px: md:flex) */}
      <div className="hidden md:flex md:h-screen md:shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Off-Canvas Drawer (Screens < 768px: md:hidden) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
          />

          {/* Sliding Drawer Container */}
          <div className="relative z-50 flex h-full max-w-[85vw] animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}