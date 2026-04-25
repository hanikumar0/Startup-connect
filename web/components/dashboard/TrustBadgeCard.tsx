"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ChevronRight, Loader2, Star, Sparkles } from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeDisplay } from "@/components/badges/BadgeDisplay";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  unverified: "text-slate-400",
  pending:    "text-amber-600",
  verified:   "text-emerald-600",
  rejected:   "text-red-500",
};

const STATUS_LABELS: Record<string, string> = {
  unverified: "Not Verified",
  pending:    "Under Review",
  verified:   "Verified ✓",
  rejected:   "Needs Resubmission",
};

export function TrustBadgeCard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetchJSON("/api/badges/status").then((res) => {
      if (res.success) setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <Card className="rounded-[32px] border-none shadow-sm bg-white">
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const verStatus = data?.verificationStatus || "unverified";
  const badges: string[] = data?.badges || [];
  const trustScore = data?.trustScore || 0;
  const isVerified = verStatus === "verified";

  return (
    <Card
      className="rounded-[32px] border border-slate-100 shadow-sm bg-white overflow-hidden cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      onClick={() => router.push("/dashboard/settings/verification")}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center",
              isVerified ? "bg-emerald-50" : "bg-slate-50"
            )}>
              <ShieldCheck size={16} className={isVerified ? "text-emerald-600" : "text-slate-400"} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Layer</p>
              <p className={cn("text-xs font-bold", STATUS_COLORS[verStatus])}>
                {STATUS_LABELS[verStatus]}
              </p>
            </div>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Trust Score Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Trust Score</span>
            <span className="text-[11px] font-black text-slate-700">{trustScore}/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all duration-1000",
                isVerified ? "bg-gradient-to-r from-emerald-500 to-indigo-500" : "bg-slate-300"
              )}
              style={{ width: `${Math.max(4, trustScore)}%` }}
            />
          </div>
        </div>

        {/* Badges */}
        {badges.length > 0 ? (
          <BadgeDisplay badges={badges} size="xs" max={3} />
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <Sparkles size={12} className="text-indigo-600 shrink-0" />
            <p className="text-[10px] font-bold text-indigo-600">
              Get verified to earn trust badges
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
