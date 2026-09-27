"use client";

import { useCallback, useEffect, useState, useMemo, memo } from "react";
import { useAuthContext } from "@/context/AuthContext";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  JobApplication,
  ApplicationStatus,
} from "@/services/application.service";
import { getApiErrorMessage } from "@/utils/errors";
import {
  Briefcase,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Edit2,
  X,
  Building,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

function getStatusBadge(status: ApplicationStatus) {
  switch (status) {
    case "OFFER":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "INTERVIEWING":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "APPLIED":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "REJECTED":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
  }
}

interface ApplicationCardProps {
  app: JobApplication;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

const ApplicationCard = memo(function ApplicationCard({ app, onEdit, onDelete }: ApplicationCardProps) {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 hover:border-indigo-500/40 transition shadow-sm animate-slide-up">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              {app.job_title}
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <Building className="h-3.5 w-3.5 text-slate-400" /> {app.company_name}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
              app.status
            )}`}
          >
            {app.status}
          </span>
        </div>

        <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
          {app.location && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {app.location}
            </p>
          )}
          {app.salary_range && (
            <p className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-slate-400" /> {app.salary_range}
            </p>
          )}
          {app.applied_date && (
            <p className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Applied:{" "}
              {new Date(app.applied_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {app.ats_score && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            ATS Match: {app.ats_score}%
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-3">
        {app.job_url ? (
          <a
            href={app.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-indigo-400 hover:underline"
          >
            Job Link <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">No URL</span>
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(app)}
            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(app.id)}
            className="p-1.5 text-slate-400 hover:text-rose-500 transition"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default function ApplicationsPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    location: "",
    job_url: "",
    status: "APPLIED" as ApplicationStatus,
    salary_range: "",
    notes: "",
  });

  const fetchApps = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await getApplications(statusFilter === "ALL" ? undefined : statusFilter);
      setApplications(data);
    } catch (err: any) {
      if (err?.response?.status !== 401) {
        console.error("Failed to load applications", err);
      }
      setErrorMsg(getApiErrorMessage(err, "Unable to load job applications. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [statusFilter, isAuthenticated, authLoading]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.job_title.trim() || !formData.company_name.trim()) {
      setErrorMsg("Job title and Company name are required.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      if (editingApp) {
        await updateApplication(editingApp.id, formData);
        setSuccessMsg("Application updated successfully.");
      } else {
        await createApplication(formData);
        setSuccessMsg("Application saved to tracker.");
      }
      setShowAddModal(false);
      setEditingApp(null);
      resetForm();
      fetchApps();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "Failed to save application. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this job application?")) return;
    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await deleteApplication(id);
      setSuccessMsg("Application deleted.");
      fetchApps();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, "Failed to delete application. Please try again."));
    }
  }, [fetchApps]);

  const openEdit = useCallback((app: JobApplication) => {
    setEditingApp(app);
    setFormData({
      job_title: app.job_title,
      company_name: app.company_name,
      location: app.location || "",
      job_url: app.job_url || "",
      status: app.status,
      salary_range: app.salary_range || "",
      notes: app.notes || "",
    });
    setShowAddModal(true);
  }, []);

  const resetForm = () => {
    setFormData({
      job_title: "",
      company_name: "",
      location: "",
      job_url: "",
      status: "APPLIED",
      salary_range: "",
      notes: "",
    });
  };

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const query = searchQuery.toLowerCase();
    return applications.filter((app) => {
      return (
        app.job_title.toLowerCase().includes(query) ||
        app.company_name.toLowerCase().includes(query) ||
        (app.location && app.location.toLowerCase().includes(query))
      );
    });
  }, [applications, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Application Tracker</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Manage and track all your active job opportunities in one place.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingApp(null);
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" /> Add Application
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "BOOKMARKED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-bold transition ${
                statusFilter === st
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-auto sm:min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search role, company, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-2 pl-9 pr-4 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">Loading applications...</div>
      ) : filteredApps.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 shadow-sm">
          <Briefcase className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No applications found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try adjusting your filters or track a new application.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-2xl space-y-4 animate-slide-up my-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {editingApp ? "Edit Application" : "Track New Application"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 sm:space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="e.g. Google"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ApplicationStatus })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                  >
                    <option value="BOOKMARKED">Bookmarked</option>
                    <option value="APPLIED">Applied</option>
                    <option value="INTERVIEWING">Interviewing</option>
                    <option value="OFFER">Offer</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                    placeholder="Remote / San Francisco"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Posting URL</label>
                <input
                  type="url"
                  value={formData.job_url}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Range</label>
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="e.g. $120,000 - $140,000"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Reminders</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:outline-none transition"
                  placeholder="Follow up in 3 days..."
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-bold text-white shadow-md hover:opacity-90 transition"
                >
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
