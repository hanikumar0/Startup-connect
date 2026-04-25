"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Clock, ExternalLink, ChevronRight, Sparkles, Loader2, Zap } from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

const TYPE_COLOR: Record<string, string> = {
  grant:       "text-emerald-600",
  accelerator: "text-indigo-600",
  incubator:   "text-blue-600",
  competition: "text-amber-600",
  workshop:    "text-purple-600",
  program:     "text-violet-600",
};

export function GrantsWidget() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isStartup = user?.role?.toLowerCase() === "startup";
  const [grants, setGrants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const endpoint = isStartup ? "/api/grants/recommended" : "/api/grants/closing-soon";
      const res = await apiFetchJSON(endpoint);
      if (res.success) {
        setGrants((res.grants || []).slice(0, 3));
      }
    } catch {}
    setIsLoading(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          {isStartup ? <Sparkles size={12} className="text-indigo-600" /> : <Trophy size={12} className="text-emerald-600" />}
          {isStartup ? "Matched Grants" : "Closing Soon"}
        </h3>
        <Link href="/dashboard/grants" className="text-[10px] font-bold text-indigo-600 hover:opacity-70 transition-opacity">
          View All
        </Link>
      </div>

      <Card className="rounded-[28px] border border-slate-50 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <CardContent className="p-8 flex justify-center">
            <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
          </CardContent>
        ) : grants.length > 0 ? (
          <div className="divide-y divide-slate-50">
            {grants.map((grant, i) => {
              const daysLeft = grant.deadline
                ? Math.floor((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              const isUrgent = daysLeft !== null && daysLeft <= 7;

              return (
                <div
                  key={grant._id || i}
                  className="p-4 hover:bg-slate-50 transition-all cursor-pointer group"
                  onClick={() => router.push("/dashboard/grants")}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Trophy size={14} className={TYPE_COLOR[grant.type] || "text-indigo-600"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {grant.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-slate-400 font-medium truncate">{grant.provider}</p>
                        {grant.fundingAmount && (
                          <span className="text-[10px] font-bold text-emerald-600 shrink-0">{grant.fundingAmount}</span>
                        )}
                      </div>
                      {/* Match reasons for recommended */}
                      {grant.matchReasons?.[0] && (
                        <p className="text-[9px] text-indigo-500 font-bold mt-0.5">{grant.matchReasons[0]}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      {daysLeft !== null && (
                        <span className={cn(
                          "text-[9px] font-bold flex items-center gap-0.5",
                          isUrgent ? "text-red-500" : "text-slate-400"
                        )}>
                          <Clock size={9} />
                          {isUrgent ? `${daysLeft}d!` : `${daysLeft}d`}
                        </span>
                      )}
                      {!daysLeft && (
                        <span className="text-[9px] text-slate-300 font-bold">{grant.deadlineText || "Open"}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <CardContent className="p-8 text-center">
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              No grants found
            </p>
          </CardContent>
        )}

        {grants.length > 0 && (
          <div
            className="px-4 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => router.push("/dashboard/grants")}
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              View all opportunities
            </span>
            <ChevronRight size={12} className="text-slate-300" />
          </div>
        )}
      </Card>
    </section>
  );
}
