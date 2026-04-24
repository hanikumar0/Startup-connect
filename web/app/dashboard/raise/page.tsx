"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import RaiseProgressCard from "@/components/raise/RaiseProgressCard";
import { 
    Zap, 
    TrendingUp, 
    Calendar, 
    Plus, 
    ArrowRight, 
    ShieldCheck, 
    Briefcase,
    BrainCircuit,
    LineChart,
    Users,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function RaiseTrackerPage() {
    const { user } = useAuthStore();
    const [round, setRound] = useState<any>(null);
    const [pipeline, setPipeline] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRaiseData();
    }, []);

    const fetchRaiseData = async () => {
        try {
            const res = await apiFetch("/api/raise/me");
            const data = await res.json();
            if (data.success) {
                setRound(data.round);
                setPipeline(data.pipeline);
            }
        } catch (error) {
            toast.error("Failed to load fundraising data");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="h-[600px] flex items-center justify-center">
            <Zap className="h-8 w-8 animate-pulse text-indigo-600" />
        </div>;
    }

    return (
        <div className="space-y-10 p-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic">
                                    Raise Tracker
                                </h1>
                                <Badge className="bg-zinc-950 text-white font-black text-[10px] uppercase tracking-widest h-6 px-3">BETA</Badge>
                            </div>
                            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-1">
                                Institutional Round Management & Momentum Tracking
                            </p>
                        </div>
                    </div>
                </div>

                {!round && (
                    <Button className="h-14 px-8 bg-zinc-950 text-white font-black uppercase text-xs tracking-[2px] rounded-2xl hover:translate-y-[-2px] transition-all shadow-xl">
                        <Plus size={18} className="mr-2" />
                        Setup Funding Round
                    </Button>
                )}
            </header>

            {!round ? (
                <Card className="rounded-[40px] border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <CardContent className="p-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center shadow-sm text-zinc-300">
                            <Target size={48} />
                        </div>
                        <div className="max-w-md">
                            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight italic mb-2">No Active Round</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed">
                                Professionalize your fundraising by setting up a target round. Track commitments, due diligence, and round velocity in one secure hub.
                            </p>
                        </div>
                        <Button className="h-12 px-8 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest">
                            Initialize Seed Round
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Main Progress Area */}
                    <div className="lg:col-span-8 space-y-8">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <RaiseProgressCard round={round} pipeline={pipeline} />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* AI Forecasting */}
                             <Card className="rounded-[32px] border-none shadow-xl bg-zinc-900 text-white overflow-hidden group">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400">
                                                <BrainCircuit size={20} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">AI Forecasting</span>
                                        </div>
                                        <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[8px] font-black uppercase tracking-widest">Live</Badge>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Likely Close Date</p>
                                            <p className="text-xl font-black tracking-tighter italic">June 14, 2026</p>
                                        </div>
                                        
                                        <p className="text-[13px] font-medium text-zinc-400 leading-relaxed italic">
                                            "Your round velocity is 1.4x higher than ecosystem benchmarks for SaaS. Secure 3 more hard commitments to mitigate Series A transition risk."
                                        </p>
                                    </div>

                                    <Button variant="outline" className="w-full h-12 border-white/10 hover:bg-white/5 text-white font-black uppercase text-[10px] tracking-widest rounded-xl">
                                        View Scenario Analysis
                                    </Button>
                                </CardContent>
                             </Card>

                             {/* Round Details */}
                             <Card className="rounded-[32px] border-zinc-100 shadow-xl bg-white">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-900">
                                            <Briefcase size={20} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Round Allocation</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Min Ticket</span>
                                            <span className="text-sm font-black text-zinc-900">₹50,00,000</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Max Ticket</span>
                                            <span className="text-sm font-black text-zinc-900">₹2,00,00,000</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Valuation Range</span>
                                            <span className="text-sm font-black text-zinc-900 italic uppercase">Competitive</span>
                                        </div>
                                    </div>
                                </CardContent>
                             </Card>
                        </div>
                    </div>

                    {/* Commitments Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[11px] font-black uppercase tracking-[2px] text-zinc-900">Recent Commitments</h3>
                                <Badge className="bg-zinc-100 text-zinc-600 font-black text-[10px]">{round.commitments.length}</Badge>
                            </div>
                            
                            <div className="space-y-3">
                                {round.commitments.map((commit: any, i: number) => (
                                    <Card key={i} className="rounded-2xl border-zinc-100 hover:border-indigo-100 transition-all shadow-sm">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-xs font-black text-zinc-400 border border-zinc-100">
                                                {commit.investorId?.name?.charAt(0) || "I"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-zinc-900 truncate uppercase mt-0.5">{commit.investorId?.name || "Private Allocator"}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase tracking-tight h-4 px-1 border-none",
                                                        commit.type === 'hard' ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
                                                    )}>
                                                        {commit.type} COMMIT
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-zinc-900 tracking-tight">₹{(commit.amount / 100000).toFixed(0)}L</p>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Confirmed</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {round.commitments.length === 0 && (
                                    <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[32px] bg-zinc-50/30">
                                         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">No commitments recorded</p>
                                    </div>
                                )}
                            </div>

                            <Button className="w-full h-14 bg-white border border-zinc-100 text-zinc-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition-all shadow-sm">
                                <Plus size={16} className="mr-2 text-indigo-600" />
                                Record New Commitment
                            </Button>
                        </section>

                        {/* Round Momentum */}
                        <Card className="rounded-[32px] border-none shadow-2xl bg-indigo-600 text-white overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
                            <CardContent className="p-8 space-y-6 relative z-10">
                                <div className="flex items-center gap-3">
                                     <LineChart size={20} className="text-indigo-200" />
                                     <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Round Momentum</span>
                                </div>
                                <div className="flex items-end gap-3">
                                    <h4 className="text-5xl font-black tracking-tighter italic leading-none">High</h4>
                                    <Badge className="bg-white/20 text-white font-black text-[10px] h-6 px-3 border-none">TOP 5%</Badge>
                                </div>
                                <p className="text-[13px] font-medium leading-relaxed opacity-80">
                                    Your round visibility in investor feeds is increased by <span className="font-black">240%</span> due to high engagement.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            )}
        </div>
    );
}
