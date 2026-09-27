"use client";

import { useState } from "react";
import { Settings, User, Key, Bell, Shield } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
          <Settings className="h-3.5 w-3.5" /> Preferences
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">Manage your account configurations and AI preferences.</p>
      </div>

      {saved && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Application Preferences
          </h2>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Auto-extract job description on supported sites</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-0 shrink-0" />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="text-slate-700 dark:text-slate-300">Show instant ATS match badge in browser extension</span>
              <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-indigo-600 focus:ring-0 shrink-0" />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
