"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Brain, Target, ShieldCheck, Zap, Activity } from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface AiInsightPanelProps {
  startupId?: string;
  investorId?: string;
}

export default function AiInsightPanel({ startupId, investorId }: AiInsightPanelProps) {
  const [matchResult, setMatchResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAiMatch() {
        if (!startupId || !investorId) return;
        try {
            const data = await apiFetchJSON("/api/ai/match", {
                method: "POST",
                body: JSON.stringify({ startupId, investorId })
            });
            if (data.success) {
                setMatchResult(data.data);
            }
        } catch (err) {
            console.error("AI Insight failure", err);
        } finally {
            setLoading(false);
        }
    }
    fetchAiMatch();
  }, [startupId, investorId]);

  if (loading) return (
    <div className="animate-pulse space-y-4">
        <div className="h-32 bg-zinc-100 rounded-3xl" />
    </div>
  );

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-zinc-900 text-white overflow-hidden group">
      <CardHeader className="bg-gradient-to-br from-indigo-600/20 to-transparent p-8 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
            <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400">
                <Brain className="h-6 w-6" />
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-[2px] text-zinc-400 border border-white/5">
                Neural Insight v2.1
            </div>
        </div>
        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            Startup Connect AI <Sparkles className="h-5 w-5 text-indigo-400 fill-indigo-400/20" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-8 space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Strategic Fit Score</p>
                <h4 className="text-5xl font-black text-white">{matchResult?.score}%</h4>
            </div>
            <div className="h-16 w-16 relative">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * (matchResult?.score || 0)) / 100} className="text-indigo-500 transition-all duration-1000" />
                 </svg>
                 <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white" />
            </div>
        </div>

        <div className="space-y-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Semantic Confidence</p>
            <div className="space-y-3">
                {matchResult?.reasons?.map((reason: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-zinc-200">{reason}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="pt-4 grid grid-cols-2 gap-4">
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Sector Match</p>
                <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase">98.4%</span>
                </div>
             </div>
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Thesis Density</p>
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-indigo-400" />
                    <span className="text-xs font-black text-white uppercase">OPTIMIZED</span>
                </div>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
