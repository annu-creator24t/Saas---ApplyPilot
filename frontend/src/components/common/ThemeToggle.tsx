"use client";

import { memo } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";

function ThemeToggleComponent({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center rounded-xl p-2.5 text-xs font-semibold transition-all duration-200 border ${
        theme === "dark"
          ? "bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 hover:border-slate-600 shadow-sm"
          : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 shadow-sm"
      } ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 animate-in fade-in zoom-in duration-200" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 animate-in fade-in zoom-in duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

const ThemeToggle = memo(ThemeToggleComponent);
export default ThemeToggle;

