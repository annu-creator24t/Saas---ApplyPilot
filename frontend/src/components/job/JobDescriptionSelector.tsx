"use client";

import { useState, useEffect, memo } from "react";
import { useJobDescription, SavedJobDescription } from "@/context/JobDescriptionContext";
import {
  Briefcase,
  Layers,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Upload,
  FileText,
  Save,
  X,
} from "lucide-react";

interface JobDescriptionSelectorProps {
  title?: string;
  subtitle?: string;
  onChangeJD?: (jdText: string, jobTitle?: string, companyName?: string) => void;
  className?: string;
}

function JobDescriptionSelectorComponent({
  title = "Target Job Description",
  subtitle = "Select a saved target role or paste a new job description.",
  onChangeJD,
  className = "",
}: JobDescriptionSelectorProps) {
  const {
    jobDescriptions,
    selectedJobDescription,
    selectJobDescriptionById,
    saveJobDescription,
    deleteJobDescription,
    updateJobDescription,
  } = useJobDescription();

  const [isChanging, setIsChanging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [companyNameInput, setCompanyNameInput] = useState("");
  const [jdTextInput, setJdTextInput] = useState("");
  const [fileLoading, setFileLoading] = useState(false);

  // Sync active selection to parent form if needed
  useEffect(() => {
    if (selectedJobDescription) {
      if (onChangeJD) {
        onChangeJD(
          selectedJobDescription.job_description,
          selectedJobDescription.job_title,
          selectedJobDescription.company_name
        );
      }
    }
  }, [selectedJobDescription, onChangeJD]);

  const handleCreateSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdTextInput.trim()) return;

    const saved = saveJobDescription(
      jobTitleInput || "Target Role",
      companyNameInput || "Target Company",
      jdTextInput
    );

    setIsCreating(false);
    setIsChanging(false);
    setJobTitleInput("");
    setCompanyNameInput("");
    setJdTextInput("");

    if (onChangeJD) {
      onChangeJD(saved.job_description, saved.job_title, saved.company_name);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileLoading(true);
      const text = await file.text();
      // If filename has extension, prefill title
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      setJobTitleInput((prev) => prev || baseName);
      setJdTextInput((prev) => (prev ? `${prev}\n\n${text}` : text));
    } catch (err) {
      console.error("Failed to read file text:", err);
    } finally {
      setFileLoading(false);
    }
  };

  const handleSelect = (jd: SavedJobDescription) => {
    selectJobDescriptionById(jd.id);
    setIsChanging(false);
    if (onChangeJD) {
      onChangeJD(jd.job_description, jd.job_title, jd.company_name);
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-cyan-500" /> {title}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {jobDescriptions.length > 0 && (
            <button
              onClick={() => {
                setIsChanging(!isChanging);
                setIsCreating(false);
              }}
              type="button"
              className="inline-flex items-center gap-1 rounded-xl bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{isChanging ? "Done" : "Saved Job Descriptions"}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isChanging ? "rotate-180" : ""}`} />
            </button>
          )}

          <button
            onClick={() => {
              setIsCreating(!isCreating);
              setIsChanging(false);
            }}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add / Paste New JD</span>
          </button>
        </div>
      </div>

      {/* ACTIVE SELECTED JOB DESCRIPTION VIEW */}
      {selectedJobDescription && !isChanging && !isCreating && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-xs border border-cyan-500/20">
                <Briefcase className="h-4 w-4" />
              </span>
              <div className="truncate">
                <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate">
                  {selectedJobDescription.job_title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedJobDescription.company_name}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="h-3 w-3" /> Active JD
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 italic">
            &quot;{selectedJobDescription.job_description.slice(0, 220)}...&quot;
          </p>
        </div>
      )}

      {/* SAVED JDS SELECTION LIST */}
      {isChanging && (
        <div className="space-y-3 animate-slide-down">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select from saved target roles:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
            {jobDescriptions.map((jd) => {
              const isSelected = selectedJobDescription?.id === jd.id;
              return (
                <div
                  key={jd.id}
                  className={`flex flex-col justify-between p-3.5 rounded-xl border text-left text-xs transition ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-500/10 text-slate-900 dark:text-white font-bold"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:border-cyan-400"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold truncate text-xs">{jd.job_title}</p>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[11px] opacity-75">{jd.company_name}</p>
                    <p className="text-[10px] opacity-60 line-clamp-2 italic">&quot;{jd.job_description.slice(0, 100)}...&quot;</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelect(jd)}
                      className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      {isSelected ? "Active JD" : "Select JD"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteJobDescription(jd.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition"
                      title="Delete JD"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / PASTE NEW JOB DESCRIPTION FORM */}
      {(isCreating || (!selectedJobDescription && jobDescriptions.length === 0)) && (
        <form onSubmit={handleCreateSave} className="space-y-4 pt-1 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={jobTitleInput}
                onChange={(e) => setJobTitleInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Google / Microsoft"
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs text-slate-900 dark:text-slate-200 focus:border-cyan-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Job Description Text *
              </label>

              <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer">
                <Upload className="h-3 w-3" />
                <span>Upload JD File (.txt/.docx)</span>
                <input
                  type="file"
                  accept=".txt,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={6}
              value={jdTextInput}
              onChange={(e) => setJdTextInput(e.target.value)}
              placeholder="Paste full job description requirements here..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-cyan-500 focus:outline-none transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            {jobDescriptions.length > 0 && (
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={!jdTextInput.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save & Use Target JD</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const JobDescriptionSelector = memo(JobDescriptionSelectorComponent);
export default JobDescriptionSelector;
