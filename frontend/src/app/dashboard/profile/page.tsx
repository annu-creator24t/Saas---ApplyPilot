"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import api from "@/lib/axios";
import { User, Mail, Key, CheckCircle, AlertCircle, Loader2, CreditCard, Zap } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg(null);
      await api.patch("/users/me", { full_name: fullName });
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    try {
      setSaving(true);
      setMsg(null);
      await api.patch("/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Failed to change password." });
    } finally {
      setSaving(false);
    }
  };

  const isPro = (user as any)?.subscription_plan === "pro";
  const isTrial = Boolean((user as any)?.trial_active);
  const trialDaysRemaining = (user as any)?.trial_days_remaining || 0;

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-2">
          <User className="h-3.5 w-3.5" /> Account Settings
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User Account & Profile</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Manage your personal information, subscription plan, and security details.</p>
      </div>

      {msg && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 sm:p-4 text-xs font-medium border ${
            msg.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400"
          }`}
        >
          {msg.type === "success" ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Subscription Quick Status */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Subscription</span>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {isPro
                ? "ApplyPilot Pro Plan (₹99/mo) · Active"
                : isTrial
                ? `10-Day Free Trial (${trialDaysRemaining} days remaining)`
                : "Free Plan (3 AI Credits Limit)"}
            </h3>
          </div>
        </div>

        <Link
          href="/dashboard/subscription"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition shrink-0"
        >
          <CreditCard className="h-4 w-4" /> Manage Subscription
        </Link>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdateProfile} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600 dark:text-indigo-400" /> Personal Information
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save Profile
          </button>
        </div>
      </form>

      {/* Security / Password Form */}
      <form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Key className="h-4 w-4 text-blue-600 dark:text-indigo-400" /> Security & Password
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="•••••••• (Min 8 characters)"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !currentPassword || !newPassword}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}