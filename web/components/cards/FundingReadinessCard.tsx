
"use client";

import { useEffect, useState } from "react";
import { Zap, Trophy, TrendingUp, BarChart3, PieChart, Users, ChevronRight, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiFetchJSON } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

export function FundingReadinessCard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        fetchScore();
    }, []);

    const fetchScore = async () => {
        setLoading(true);
        try {
            const res = await apiFetchJSON("/api/funding-score/me");
            if (res.success) setData(res.data);
        } catch (err) {
            console.error("Score fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        setCalculating(true);
        try {
            const res = await apiFetchJSON("/api/funding-score/calculate", { method: "POST" });
            if (res.success) setData(res.data);
        } catch (err) {
            console.error("Calculation failed", err);
        } finally {
            setCalculating(false);
        }
    };

    if (loading) {
        return (
            <Card className="rounded-[32px] border-none bg-white shadow-sm overflow-hidden h-[400px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            </Card>
        );
    }

    const score = data?.score || 0;
    const stage = data?.stage || "Not Ready";
    
    const getScoreColor = (s: number) => {
        if (s >= 80) return "text-emerald-500";
        if (s >= 60) return "text-indigo-500";
        if (s >= 40) return "text-amber-500";
        return "text-slate-400";
    };

    const getStageBadgeColor = (st: string) => {
        switch (st) {
            case 'Series A Ready': return 'bg-emerald-50 text-emerald-600 border-none';
            case 'Seed Ready': return 'bg-indigo-50 text-indigo-600 border-none';
            case 'Pre-Seed Ready': return 'bg-blue-50 text-blue-600 border-none';
            case 'Early Progress': return 'bg-amber-50 text-amber-600 border-none';
            default: return 'bg-slate-50 text-slate-400 border-none';
        }
    };

    return (
        <Card className="rounded-[32px] border-none bg-slate-900 text-white overflow-hidden relative group shadow-2xl">
            {/* Background Grain/Texture */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            
            <CardContent className="p-10 space-y-8 relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
                            <Zap size={16} fill="currentColor" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Funding Readiness</span>
                    </div>
                    <Badge className={getStageBadgeColor(stage)}>
                        {stage}
                    </Badge>
                </div>

                {/* Score Center */}
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                        {/* Static Circle Background */}
                        <svg className="absolute inset-0 h-full w-full -rotate-90">
                            <circle
                                cx="80" cy="80" r="70"
                                fill="transparent"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="8"
                            />
                            <circle
                                cx="80" cy="80" r="70"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={Math.PI * 140}
                                strokeDashoffset={Math.PI * 140 * (1 - score / 100)}
                                className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="text-center">
                            <span className="text-5xl font-black tracking-tighter text-white">{score}</span>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ready Score</span>
                        </div>
                    </div>
                </div>

                {/* Quick Breakdown Highlights */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Profile Strength</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{data?.breakdown?.profile || 0}/20</span>
                            <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: `${(data?.breakdown?.profile / 20) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Team Signal</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">{data?.breakdown?.team || 0}/20</span>
                            <div className="h-1 w-12 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${(data?.breakdown?.team / 20) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reasons / Insights Preview */}
                {data?.reasons?.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Top Insights</p>
                        <div className="space-y-2">
                           {data.reasons.slice(0, 2).map((r: string, i: number) => (
                               <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                   <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                   <p className="text-xs font-medium text-slate-300 line-clamp-1">{r}</p>
                               </div>
                           ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="pt-4 flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        onClick={handleRecalculate}
                        disabled={calculating}
                        className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl"
                    >
                        {calculating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <TrendingUp size={14} className="mr-2" />}
                        Recalculate
                    </Button>
                    <Button 
                        onClick={() => window.location.href = "/dashboard/funding-readiness"}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-widest h-12 rounded-xl group shadow-lg shadow-indigo-900/40"
                    >
                        Manage
                        <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                <p className="text-[9px] text-center font-bold text-slate-600 uppercase tracking-tighter">
                    Last Analysis: {data?.lastCalculatedAt ? new Date(data.lastCalculatedAt).toLocaleString() : "Never"}
                </p>
            </CardContent>
        </Card>
    );
}
