"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { getAdminStats, makeUserAdmin, AdminStatsData } from "@/services/admin.service";
import {
  Users,
  Zap,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  Crown,
  Search,
  CreditCard,
  UserPlus,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuthContext();
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [promoteMsg, setPromoteMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminStats();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error("Admin stats authorization failure:", err);
      }
      setError(err?.response?.data?.message || "Unauthorized access. Admin authorization required.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    fetchStats();
  }, [isAuthenticated, authLoading]);

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoteEmail.trim()) return;
    try {
      setPromoting(true);
      setPromoteMsg(null);
      const res = await makeUserAdmin(promoteEmail.trim());
      setPromoteMsg(res.message || "User successfully promoted to Admin.");
      setPromoteEmail("");
      fetchStats();
    } catch (err: any) {
      setPromoteMsg(err?.response?.data?.message || "Failed to promote user to Admin.");
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-indigo-400 mr-3" />
        <span className="text-xs font-semibold">Loading Admin Owner Statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Admin Access Restricted</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-xs font-bold text-white dark:text-slate-900 hover:opacity-90 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Return to User Dashboard
        </Link>
      </div>
    );
  }

  const filteredUsers = stats?.recent_users?.filter(
    (u) =>
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
            <Crown className="h-3.5 w-3.5 text-amber-500" /> ApplyPilot System Owner Dashboard
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            User Statistics & Platform Metrics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics on user registrations, active AI utilization, free vs premium plan counts, and payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Metrics
          </button>
        </div>
      </div>

      {/* 5 High-Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-5">
        {/* Total Users Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {stats?.total_registered_users || 0}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Registered platform accounts</p>
        </div>

        {/* Active AI Users Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active AI Users</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {stats?.total_active_ai_users || 0}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Users using AI features</p>
        </div>

        {/* Total AI Generations Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Generations</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">
            {stats?.total_ai_generations || 0}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Successful AI runs</p>
        </div>

        {/* Free Users Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Free Users</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-700 dark:text-slate-300">
            {stats?.free_users || 0}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Standard freemium tier</p>
        </div>

        {/* Premium Users Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 p-4 sm:p-5 shadow-sm space-y-2 border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Premium Pro</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {stats?.premium_users || 0}
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Active Pro subscribers</p>
        </div>
      </div>

      {/* Admin Quick Action Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <UserPlus className="h-4 w-4 text-indigo-500" /> Admin Role Management Tool
        </h3>
        <form onSubmit={handlePromoteUser} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <input
            type="email"
            placeholder="Enter user email address to grant Admin permissions..."
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={promoting || !promoteEmail.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-5 py-3 text-xs font-bold text-white shadow-md transition"
          >
            {promoting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Promote to Admin"}
          </button>
        </form>
        {promoteMsg && (
          <p className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{promoteMsg}</p>
        )}
      </div>

      {/* Registered Users Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" /> Registered User Accounts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Overview of all registered users, roles, subscription tiers, and AI usage counts.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800/80 rounded-xl">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Subscription Tier</th>
                <th className="px-4 py-3 text-center">AI Uses Count</th>
                <th className="px-4 py-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isProUser = u.subscription_plan === "pro" && u.subscription_status === "active";
                  return (
                    <tr key={u.user_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        <div>{u.full_name}</div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        {u.is_admin || u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                            <Crown className="h-3 w-3 text-amber-500" /> Admin
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">Standard User</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isProUser ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="h-3 w-3" /> PRO TIER
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                            FREE PLAN
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {u.free_usage_count} / {isProUser ? "Unlimited" : "3"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments Log */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-4 sm:p-6 space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-500" /> Recent Subscription Payments Log
        </h3>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800/80 rounded-xl">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">User Email</th>
                <th className="px-4 py-3">UPI Ref / UTR</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {!stats?.recent_payments || stats.recent_payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    No payment submissions recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recent_payments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition">
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{p.user_email || p.user_id}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{p.upi_reference || "Instant Checkout"}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">₹{p.amount} {p.currency}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="h-3 w-3" /> {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {p.submitted_at ? new Date(p.submitted_at).toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
