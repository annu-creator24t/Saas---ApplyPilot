"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSubscriptionStatus, submitPayment, SubscriptionStatusData } from "@/services/subscription.service";
import {
  CreditCard,
  Zap,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Loader2,
  Clock,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

export default function SubscriptionPage() {
  const [subData, setSubData] = useState<SubscriptionStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upiRef, setUpiRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await getSubscriptionStatus();
      if (res?.data) {
        setSubData(res.data);
      }
    } catch (err) {
      console.error("Failed to load subscription status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("7565987815@ptsbi");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSubmittedMsg(null);

      const res = await submitPayment(upiRef.trim() || undefined);
      setSubmittedMsg(res.message || "Payment submitted. Your subscription will be activated after verification.");
      fetchStatus();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to submit payment verification.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-500 dark:text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-indigo-400 mr-3" />
        <span className="text-xs font-semibold">Loading subscription details...</span>
      </div>
    );
  }

  const isPro = subData?.is_pro;
  const isPending = subData?.subscription_status === "pending" || subData?.payment_status === "pending";
  const creditsUsed = subData?.free_usage_count || 0;
  const creditsRemaining = subData ? subData.free_credits_remaining : Math.max(0, 3 - creditsUsed);

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 px-3.5 py-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
          <Sparkles className="h-3.5 w-3.5" /> ApplyPilot Pricing & Billing
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Upgrade to ApplyPilot Pro
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Unlock unlimited AI resume checks, job match scoring, resume optimization, cover letters, and interview prep.
        </p>
      </div>

      {/* Current Plan & Credits Summary Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
          <div className="sm:pr-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Plan</span>
            <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
              <span className={`text-xl font-extrabold ${isPro ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                {isPro ? "APPLYPILOT PRO" : "FREE PLAN"}
              </span>
              {isPro && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 sm:pt-0 sm:px-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Credits Status</span>
            <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
              <Zap className={`h-5 w-5 ${isPro ? "text-emerald-500" : "text-indigo-500"}`} />
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {isPro ? "Unlimited AI" : `${creditsRemaining} / 3 remaining`}
              </span>
            </div>
          </div>

          <div className="pt-4 sm:pt-0 sm:pl-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment Status</span>
            <div className="mt-1.5 flex items-center justify-center sm:justify-start gap-2">
              {isPending ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Clock className="h-3.5 w-3.5 animate-spin" /> Pending Manual Verification
                </span>
              ) : isPro ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified & Active
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Standard Freemium Tier
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Pricing & Payment Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Plan Card */}
        <div className="rounded-3xl border-2 border-indigo-500/40 bg-gradient-to-b from-white via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-blue-600 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-2xl shadow-md">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">ApplyPilot Pro</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                For career seekers who want maximum advantage in job applications.
              </p>
            </div>

            <div className="flex items-baseline gap-1.5 pt-2">
              <span className="text-4xl font-black text-slate-900 dark:text-white">₹99</span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">/ month</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3.5">
              <div className="flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> Standalone ATS Resume Analysis</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> AI Job Description Matching</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> Resume Optimization Suggestions</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> Cover Letter Generations</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Unlimited</strong> Interview Question Generation & Practice</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-800 dark:text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Chrome Extension Full Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment QR & UPI Section */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-500" /> ApplyPilot Instant UPI Checkout
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Scan the official QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) to complete ₹99 payment.
            </p>
          </div>

          {/* Professional QR & Merchant Details Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-center space-y-5">
            {/* Corporate Branded QR Code Box */}
            <div className="p-5 bg-white rounded-2xl border-2 border-indigo-500/30 shadow-lg flex flex-col items-center transition duration-200 hover:border-indigo-500">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow flex items-center gap-1.5 mb-3">
                <Sparkles className="h-3.5 w-3.5" /> ApplyPilot Official UPI QR
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-inner">
                <img
                  src="/clean-qr.png"
                  alt="ApplyPilot Official UPI QR Code"
                  className="w-48 h-48 rounded-lg object-contain"
                />
              </div>
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  <ShieldCheck className="h-3.5 w-3.5" /> Scan with GPay / PhonePe / Paytm / BHIM
                </div>
                <a
                  href="upi://pay?pa=7565987815@ptsbi&pn=ApplyPilot%20AI%20Services&am=99&cu=INR&tn=ApplyPilot%20Pro%20Subscription"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 rounded-xl shadow-md transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Pay Directly via UPI App
                </a>
              </div>
            </div>

            {/* Merchant Info & Supported UPI Apps */}
            <div className="w-full max-w-sm space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Merchant Account:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">ApplyPilot AI Services</span>
              </div>
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subscription Price:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">₹99 / month</span>
              </div>

              {/* UPI VPA Display & Copy */}
              <div className="space-y-1 text-left pt-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">UPI VPA ID</span>
                <div className="flex items-center justify-between rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-inner">
                  <span>7565987815@ptsbi</span>
                  <button
                    onClick={handleCopyUpi}
                    type="button"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
                    title="Copy UPI ID"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] text-emerald-500 font-sans font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span className="text-[10px] text-slate-500 font-sans font-semibold">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* UPI Apps Row */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">Google Pay</span>
                <span>•</span>
                <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">PhonePe</span>
                <span>•</span>
                <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">Paytm</span>
                <span>•</span>
                <span className="bg-slate-200/60 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">BHIM</span>
              </div>
            </div>
          </div>

          {/* Form to submit completion */}
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                UPI Reference / UTR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 423456789012"
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                disabled={submitting || isPending}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none transition"
              />
            </div>

            {submittedMsg && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{submittedMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isPending}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold text-white shadow-lg transition ${
                isPending
                  ? "bg-slate-400 dark:bg-slate-800 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 shadow-indigo-600/25"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Confirmation...
                </>
              ) : isPending ? (
                <>
                  <Clock className="h-4 w-4" /> Verification Pending Approval
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> I Have Completed Payment
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Note: Your subscription will be activated automatically once manual verification completes.
          </p>
        </div>
      </div>
    </div>
  );
}
