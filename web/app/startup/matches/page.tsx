"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MatchCard from "@/components/discover/MatchCard";
import { apiFetchJSON } from "@/lib/api";
import { Loader2, Zap, Sparkles, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StartupMatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await apiFetchJSON("/api/match/me");
        if (data.success) {
          setMatches(data.data);
        }
      } catch (err) {
        console.error("Match error", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMatches();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-[1240px] mx-auto px-6 py-10 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span>Discovery</span>
               <ChevronRight size={12} />
               <span>Matches</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
               Your Investor Matches
            </h1>
            <p className="text-sm text-slate-500 font-medium">
               Analyzing <span className="text-slate-900 font-bold">{matches.length} matches</span> based on your current fundraising thesis.
            </p>
          </div>
          <Button variant="outline" className="h-9 border-slate-200 text-slate-900 font-bold text-xs rounded-md shadow-sm hover:bg-slate-50">
            <Filter size={14} className="mr-2" /> Refresh matches
          </Button>
        </header>

        {isLoading ? (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-xs font-bold tracking-widest uppercase text-slate-400">Scanning private markets...</p>
                </div>
            </div>
        ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match, idx) => (
                    <MatchCard key={idx} match={match} type="investor" />
                ))}
            </div>
        ) : (
            <div className="py-24 text-center bg-white border border-border border-dashed rounded-lg">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No matches found yet</h3>
                <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">
                    We're still analyzing investor theses for your sector. Try updating your profile details to improve signal.
                </p>
                <Link href="/settings">
                   <Button className="mt-8 h-10 px-6 bg-primary text-white font-bold rounded-md">
                      Update Profile
                   </Button>
                </Link>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}
