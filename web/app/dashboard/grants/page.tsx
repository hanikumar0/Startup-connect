"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Trophy, Search, Filter, ExternalLink, Clock, Globe, Zap, 
  Building2, Star, GraduationCap, Target, Sparkles, ChevronRight,
  BookOpen, Loader2, X, Calendar, TrendingUp
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const TYPE_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  grant:        { label: "Grant",        icon: Trophy,       color: "text-emerald-600", bg: "bg-emerald-50" },
  accelerator:  { label: "Accelerator",  icon: Zap,          color: "text-indigo-600",  bg: "bg-indigo-50" },
  incubator:    { label: "Incubator",    icon: Building2,    color: "text-blue-600",    bg: "bg-blue-50" },
  competition:  { label: "Competition",  icon: Star,         color: "text-amber-600",   bg: "bg-amber-50" },
  workshop:     { label: "Workshop",     icon: BookOpen,     color: "text-purple-600",  bg: "bg-purple-50" },
  program:      { label: "Program",      icon: GraduationCap,color: "text-violet-600",  bg: "bg-violet-50" },
};

const TABS = ["All", "Grants", "Accelerators", "Incubators", "Programs", "Competitions"] as const;
type Tab = typeof TABS[number];
const TAB_TO_TYPE: Record<Tab, string | null> = {
  All: null, Grants: "grant", Accelerators: "accelerator",
  Incubators: "incubator", Programs: "program", Competitions: "competition",
};

function GrantCard({ grant, recommended = false }: { grant: any; recommended?: boolean }) {
  const typeMeta = TYPE_META[grant.type] || TYPE_META.grant;
  const Icon = typeMeta.icon;

  const daysLeft = grant.deadline
    ? Math.floor((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const isSoon = daysLeft !== null && daysLeft > 7 && daysLeft <= 30;

  return (
    <Card className="group rounded-[24px] border border-slate-100 bg-white hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-500 overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", typeMeta.bg)}>
              <Icon size={18} className={typeMeta.color} />
            </div>
            <div>
              <p className={cn("text-[10px] font-bold uppercase tracking-wider", typeMeta.color)}>
                {typeMeta.label}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">{grant.provider}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {grant.isFeatured && (
              <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Featured
              </span>
            )}
            {recommended && (
              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={8} /> AI Match
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
          {grant.title}
        </h3>

        {/* Match reasons */}
        {recommended && grant.matchReasons?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {grant.matchReasons.slice(0, 2).map((r: string, i: number) => (
              <span key={i} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Funding amount */}
        {grant.fundingAmount && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Funding:</span>
            <span className="text-[12px] font-black text-slate-800">{grant.fundingAmount}</span>
          </div>
        )}

        {/* Sectors */}
        {grant.sectors?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {grant.sectors.slice(0, 3).map((s: string) => (
              <span key={s} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full border border-slate-100">
                {s}
              </span>
            ))}
            {grant.sectors.length > 3 && (
              <span className="text-[9px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded-full border border-slate-100">
                +{grant.sectors.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className={isUrgent ? "text-red-500" : isSoon ? "text-amber-500" : "text-slate-300"} />
            {daysLeft !== null ? (
              <span className={cn("text-[10px] font-bold", isUrgent ? "text-red-500" : isSoon ? "text-amber-500" : "text-slate-400")}>
                {isUrgent ? `⚡ ${daysLeft}d left!` : isSoon ? `${daysLeft}d left` : `${daysLeft}d remaining`}
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400">
                {grant.deadlineText || "Rolling"}
              </span>
            )}
          </div>
          {grant.applyUrl && (
            <a
              href={grant.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Apply <ExternalLink size={10} />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function GrantsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isStartup = user?.role?.toLowerCase() === "startup";

  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [grants, setGrants] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [closingSoon, setClosingSoon] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const typeFilter = TAB_TO_TYPE[activeTab];
      const params = new URLSearchParams({ limit: "24" });
      if (typeFilter) params.set("type", typeFilter);

      const [grantsRes, closingRes] = await Promise.all([
        apiFetchJSON(`/api/grants?${params}`),
        apiFetchJSON("/api/grants/closing-soon"),
      ]);

      if (grantsRes.success) setGrants(grantsRes.grants || []);
      if (closingRes.success) setClosingSoon(closingRes.grants || []);

      if (isStartup) {
        const recRes = await apiFetchJSON("/api/grants/recommended");
        if (recRes.success) setRecommended(recRes.grants || []);
      }
    } catch (err) {
      console.error("Grants load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const res = await apiFetchJSON(`/api/grants/search?q=${encodeURIComponent(q)}`);
      if (res.success) setSearchResults(res.grants || []);
    } catch {}
    setSearching(false);
  }, []);

  const displayGrants = searchQuery ? searchResults : grants;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <span>GRANTS</span>
          <span className="h-1 w-1 bg-slate-300 rounded-full" />
          <span className="text-slate-600">ACCELERATOR ENGINE</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Funding Opportunities
            </h1>
            <p className="text-sm text-slate-400 font-medium mt-1">
              AI-matched grants, accelerators & programs for your startup
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search grants, programs..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 h-10 rounded-2xl border-slate-200 text-sm bg-white"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-50 rounded-2xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all",
              activeTab === tab
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Closing Soon — urgent strip */}
          {!searchQuery && closingSoon.length > 0 && activeTab === "All" && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock size={10} className="text-red-500" />
                </div>
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">Closing Soon</h2>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {closingSoon.map((grant) => {
                  const daysLeft = Math.floor((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={grant._id} className="min-w-[280px] flex-shrink-0 bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-[20px] p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full uppercase">
                          ⚡ {daysLeft}d left
                        </span>
                        <span className="text-[9px] font-bold text-slate-400">{(TYPE_META[grant.type] || TYPE_META.grant).label}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-2">{grant.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{grant.provider}</p>
                      {grant.fundingAmount && (
                        <p className="text-[11px] font-black text-emerald-600">{grant.fundingAmount}</p>
                      )}
                      {grant.applyUrl && (
                        <a href={grant.applyUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
                          Apply Now <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* AI Recommended — Startup only */}
          {!searchQuery && isStartup && recommended.length > 0 && activeTab === "All" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Sparkles size={12} className="text-indigo-600" /> AI Recommended for You
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recommended.slice(0, 6).map((grant) => (
                  <GrantCard key={grant._id} grant={grant} recommended />
                ))}
              </div>
            </section>
          )}

          {/* Main Grid */}
          <section className="space-y-4">
            {!searchQuery && (
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                  {activeTab === "All" ? "All Opportunities" : activeTab}
                </h2>
                <span className="text-[10px] font-bold text-slate-400">{displayGrants.length} found</span>
              </div>
            )}
            {searchQuery && (
              <div className="flex items-center gap-2 px-1">
                <h2 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">
                  Search results for "{searchQuery}"
                </h2>
                {searching && <Loader2 size={12} className="text-indigo-600 animate-spin" />}
              </div>
            )}

            {displayGrants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayGrants.map((grant) => (
                  <GrantCard key={grant._id} grant={grant} />
                ))}
              </div>
            ) : (
              <Card className="rounded-[32px] border border-slate-50">
                <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                    <Trophy size={24} />
                  </div>
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                    {searchQuery ? "No results found" : "No opportunities found for this filter"}
                  </p>
                </CardContent>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
