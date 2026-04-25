"use client";

import { useEffect, useState } from "react";
import { 
  ShieldCheck, Clock, CheckCircle2, XCircle, Upload, Link2,
  FileText, Loader2, ChevronRight, Star, Sparkles, AlertCircle
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeDisplay, BADGE_META } from "@/components/badges/BadgeDisplay";
import { cn } from "@/lib/utils";

const STATUS_META = {
  unverified: { label: "Not Submitted", color: "text-slate-400", bg: "bg-slate-50", icon: AlertCircle },
  pending:    { label: "Under Review", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  verified:   { label: "Verified", color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle2 },
  rejected:   { label: "Needs Resubmission", color: "text-red-500", bg: "bg-red-50", icon: XCircle },
};

export default function VerificationPage() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    linkedinUrl: "",
    websiteUrl: "",
    gstNumber: "",
    cinNumber: "",
    msmeNumber: "",
    additionalNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    const res = await apiFetchJSON("/api/badges/status");
    if (res.success) setStatus(res);
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await apiFetchJSON("/api/badges/request", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (res.success) {
      setSubmitted(true);
      await loadStatus();
    }
    setSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const verStatus = status?.verificationStatus || "unverified";
  const statusMeta = STATUS_META[verStatus as keyof typeof STATUS_META] || STATUS_META.unverified;
  const StatusIcon = statusMeta.icon;
  const earnedBadges: string[] = status?.badges || [];
  const eligibleBadges: string[] = status?.eligibleBadges || [];
  const trustScore = status?.trustScore || 0;

  return (
    <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>SETTINGS</span>
          <span className="h-1 w-1 bg-slate-300 rounded-full" />
          <span className="text-slate-600">VERIFICATION</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Trust & Badges</h1>
        <p className="text-sm text-slate-400">Get verified to unlock premium matching, badges, and platform visibility.</p>
      </div>

      {/* Current Status Card */}
      <Card className="rounded-[28px] border border-slate-100 shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", statusMeta.bg)}>
                <StatusIcon size={22} className={statusMeta.color} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification Status</p>
                <p className={cn("text-sm font-bold", statusMeta.color)}>{statusMeta.label}</p>
              </div>
            </div>
            {/* Trust Score */}
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Score</p>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-slate-900">{trustScore}</span>
                <span className="text-sm text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {/* Trust score bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${trustScore}%` }}
              />
            </div>
          </div>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Badges</p>
              <BadgeDisplay badges={earnedBadges} size="md" max={8} />
            </div>
          )}

          {/* Eligible Badges Preview */}
          {eligibleBadges.length > 0 && verStatus !== "verified" && (
            <div className="space-y-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-indigo-600" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">You Can Earn</p>
              </div>
              <BadgeDisplay badges={eligibleBadges} size="sm" max={6} />
            </div>
          )}

          {verStatus === "verified" && (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-700">
                You're fully verified! Your badges are active and visible across the platform.
              </p>
            </div>
          )}

          {status?.latestRequest?.rejectionReason && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">Rejection Reason</p>
              <p className="text-xs text-red-600">{status.latestRequest.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit / Resubmit Form */}
      {(verStatus === "unverified" || verStatus === "rejected") && !submitted && (
        <Card className="rounded-[28px] border border-slate-100 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Submit Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Provide your business details to earn verified badges. Fields marked optional can be added later.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  LinkedIn Profile URL
                </label>
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Company Website
                </label>
                <Input
                  placeholder="https://yourstartup.com"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    GST No. <span className="text-slate-300">(opt)</span>
                  </label>
                  <Input
                    placeholder="22AAAAA..."
                    value={form.gstNumber}
                    onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    CIN <span className="text-slate-300">(opt)</span>
                  </label>
                  <Input
                    placeholder="U12345..."
                    value={form.cinNumber}
                    onChange={(e) => setForm({ ...form, cinNumber: e.target.value })}
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    MSME <span className="text-slate-300">(opt)</span>
                  </label>
                  <Input
                    placeholder="UDYAM-..."
                    value={form.msmeNumber}
                    onChange={(e) => setForm({ ...form, msmeNumber: e.target.value })}
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Additional Notes <span className="text-slate-300">(optional)</span>
                </label>
                <Textarea
                  placeholder="Tell us anything that helps verify your startup (press coverage, traction, etc.)"
                  value={form.additionalNotes}
                  onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                  className="rounded-xl border-slate-200 resize-none"
                  rows={3}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || (!form.linkedinUrl && !form.websiteUrl)}
              className="w-full h-12 bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
              ) : (
                <><ShieldCheck size={14} className="mr-2" /> Submit for Verification</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pending message */}
      {(verStatus === "pending" || submitted) && (
        <Card className="rounded-[28px] border border-amber-100 bg-amber-50/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Review in Progress</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Our team typically reviews within 24–48 hours. You'll get a notification once approved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How it works */}
      <Card className="rounded-[28px] border border-slate-50 bg-slate-50/50">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">How Verification Works</h3>
          <div className="space-y-3">
            {[
              { step: "1", title: "Submit Your Details", desc: "LinkedIn, website, or company registration docs" },
              { step: "2", title: "Admin Review", desc: "Our team verifies your identity and business within 24–48h" },
              { step: "3", title: "Badges Awarded", desc: "You receive trust badges visible on your profile and cards" },
              { step: "4", title: "Higher Visibility", desc: "Verified profiles get priority in discovery and matching" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {step}
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{title}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
