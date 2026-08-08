import { Rocket, LogOut } from "lucide-react";

interface HeaderProps {
  userEmail?: string | null;
  onLogout?: () => void;
}

export default function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
          <Rocket className="h-4.5 w-4.5" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-white tracking-tight leading-none">ApplyPilot</h1>
          <span className="text-[10px] font-semibold text-indigo-400">AI Job Copilot</span>
        </div>
      </div>

      {userEmail && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 truncate max-w-[110px]" title={userEmail}>
            {userEmail}
          </span>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-slate-500 hover:text-rose-400 p-1"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}