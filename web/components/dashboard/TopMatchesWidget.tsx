
"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy, TrendingUp, ChevronRight, Loader2, Sparkles, User, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetchJSON } from "@/lib/api";
import Link from "next/link";

export function TopMatchesWidget({ role }: { role: string }) {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const endpoint = role === "startup" ? "/api/match/me" : "/api/match/me"; 
            // The /api/match/me already joins with startup/investor data
            const res = await apiFetchJSON(endpoint);
            if (res.success) {
                // For now use first 5
                setMatches(res.data.slice(0, 5));
            }
        } catch (err) {
            console.error("Match fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            </Card>
        );
    }

    if (matches.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Sparkles size={12} className="text-amber-500" /> 
                    {role === "startup" ? "Top Investor Matches" : "High-Fit Opportunities"}
                </h3>
                <Link href="/dashboard/matches" className="text-[10px] font-bold text-indigo-600 hover:opacity-70 transition-opacity uppercase tracking-widest">See Strategy</Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {matches.map((match, i) => {
                    const profile = role === "startup" ? match.investor : match.startup;
                    return (
                        <Card key={i} className="rounded-3xl border border-slate-50 bg-white hover:border-amber-100 transition-all cursor-pointer group shadow-sm hover:shadow-lg overflow-hidden">
                            <CardContent className="p-5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">
                                        {profile?.logo ? (
                                            <img src={profile.logo} alt="" className="h-full w-full object-cover rounded-xl" />
                                        ) : (
                                            <Briefcase size={16} />
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{profile?.investorName || profile?.firmName || profile?.startupName || "Anonymous"}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{profile?.investorType || profile?.industry || "Tech"}</p>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <Badge className="bg-amber-50 text-amber-600 border-none text-[10px] font-bold px-2 py-0.5">
                                        {match.score || 80}% Match
                                    </Badge>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">AI FIT SCORE</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
