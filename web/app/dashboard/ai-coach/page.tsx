"use client";

import { useState } from "react";
import {
    Sparkles,
    Send,
    BrainCircuit,
    Target,
    Zap,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Loader2,
    BarChart3,
    ArrowRight,
    ChevronRight,
    CircleDashed
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function AICoachPage() {
    const [pitch, setPitch] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!pitch.trim()) return;
        setIsAnalyzing(true);
        try {
            const response = await apiFetch("/api/pitch/analyze", {
                method: "POST",
                body: JSON.stringify({ pitchText: pitch }),
            });
            const data = await response.json();
            if (data.success) {
                setResult(data.analysis);
            }
        } catch (error) {
            console.error("Error analyzing pitch:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header section matching Institutional Console aesthetic */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-50">
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                     <span>AI Readiness Terminal</span>
                     <ChevronRight size={10} className="text-slate-300" />
                     <span className="text-slate-900/60">Pitch Optimization</span>
                  </div>
                  <h1 className="text-6xl font-black text-slate-900 tracking-[-0.04em] leading-none">
                    Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-indigo-600">Coach</span>
                  </h1>
               </div>
               
               <div className="flex items-center gap-16 text-right mb-2">
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Simulation Accuracy</p>
                     <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic">98.2%</h4>
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Lead Velocity</p>
                     <h4 className="text-4xl font-black text-slate-900 tracking-tighter italic text-indigo-600">Peak</h4>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Input Section - High Fidelity Card */}
                <div className="lg:col-span-12">
                    <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.03)] bg-white rounded-[56px] overflow-hidden group transition-all duration-700 hover:shadow-[0_60px_120px_rgba(99,102,241,0.08)]">
                        <CardHeader className="p-12 border-b border-slate-50 relative">
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                                <BrainCircuit size={120} />
                            </div>
                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-900 italic">Neural Pitch Simulation Active</h3>
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Elevator <span className="text-indigo-600">Drafter</span></h3>
                                <p className="text-sm text-slate-400 font-medium italic">Execute one-paragraph pitch analysis (problem, solution, market alignment).</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-12">
                            <Textarea
                                placeholder="Example: We are building a decentralized energy marketplace for EV charging stations using proprietary blockchain handshake protocols..."
                                className="min-h-[250px] text-xl bg-slate-50 border-none focus-visible:ring-4 focus-visible:ring-indigo-50/50 rounded-[40px] p-10 resize-none font-bold italic placeholder:text-slate-300 shadow-inner transition-all"
                                value={pitch}
                                onChange={(e) => setPitch(e.target.value)}
                            />
                            <div className="flex items-center justify-between mt-10">
                                <div className="px-6 py-2 bg-slate-50 rounded-full border border-slate-100 italic">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{pitch.split(/\s+/).filter(Boolean).length}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Verified Token Count</span>
                                </div>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !pitch.trim()}
                                    className="h-20 px-12 bg-indigo-600 hover:bg-slate-900 text-white rounded-[32px] shadow-2xl shadow-indigo-100 transition-all font-black uppercase text-xs tracking-[0.2em] gap-4 active:scale-95 group/btn"
                                >
                                    {isAnalyzing ? <CircleDashed className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 group-hover/btn:rotate-12 transition-transform" />}
                                    Analyze Neural Readiness
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section - Advanced Analytics Layout */}
                <AnimatePresence>
                {result && (
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-10"
                    >
                        {/* Score Console */}
                        <Card className="md:col-span-5 border-none shadow-[0_40px_100px_rgba(0,0,0,0.06)] bg-slate-900 text-white rounded-[56px] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-full h-full opacity-[0.05] pointer-events-none">
                                <div className="grid grid-cols-8 gap-10 p-10">
                                    {[...Array(24)].map((_, i) => <Zap key={i} size={40} />)}
                                </div>
                            </div>
                            <CardContent className="p-16 flex flex-col items-center justify-center text-center h-full min-h-[450px] relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-12 italic">Institutional Readiness Index</p>
                                <div className="relative group/score">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full group-hover/score:blur-[100px] transition-all duration-700" />
                                    <svg className="w-56 h-56 transform -rotate-90 relative">
                                        <circle
                                            cx="112"
                                            cy="112"
                                            r="100"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-white/5"
                                        />
                                        <motion.circle
                                            cx="112"
                                            cy="112"
                                            r="100"
                                            stroke="currentColor"
                                            strokeWidth="10"
                                            fill="transparent"
                                            strokeDasharray={628}
                                            initial={{ strokeDashoffset: 628 }}
                                            animate={{ strokeDashoffset: 628 - (628 * result.score) / 100 }}
                                            strokeLinecap="round"
                                            className="text-indigo-500 transition-all duration-[2000ms] ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <motion.span 
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5, duration: 1 }}
                                            className="text-7xl font-black tracking-tighter italic"
                                        >
                                            {Math.round(result.score)}<span className="text-3xl text-indigo-400">%</span>
                                        </motion.span>
                                    </div>
                                </div>
                                
                                <div className="mt-16 grid grid-cols-2 gap-6 w-full">
                                    <div className={`p-6 rounded-[32px] ${result.has_edge ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"} border flex flex-col items-center transition-all hover:scale-105 duration-500`}>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Market Edge</span>
                                        <span className={`text-sm font-black italic ${result.has_edge ? "text-emerald-400" : "text-red-400"}`}>
                                            {result.has_edge ? "DETECTED" : "NULL"}
                                        </span>
                                    </div>
                                    <div className={`p-6 rounded-[32px] ${result.has_revenue ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"} border flex flex-col items-center transition-all hover:scale-105 duration-500`}>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Revenue Node</span>
                                        <span className={`text-sm font-black italic ${result.has_revenue ? "text-emerald-400" : "text-red-400"}`}>
                                            {result.has_revenue ? "VALIDATED" : "INCOMPLETE"}
                                        </span>
                                    </div>
                                    <div className="col-span-2 pt-8 border-t border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 italic">Neural Agent Sentiment</p>
                                        <p className="text-lg font-bold italic text-white/90 leading-relaxed px-4">
                                            "{result.score > 70 ? "Protocol alignment verified. Target counterparties will find this value proposition institutional-grade." : "Structural recalibration required. Propose more robust scalability benchmarks."}"
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedback Detail Console */}
                        <div className="md:col-span-7 space-y-10">
                            <Card className="border-none shadow-[0_40px_100px_rgba(0,0,0,0.03)] bg-white rounded-[56px] overflow-hidden flex-1 border border-slate-50 transition-all duration-700 hover:shadow-[0_60px_120px_rgba(0,0,0,0.05)]">
                                <CardHeader className="p-12 border-b border-slate-50 flex flex-row items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 italic">Optimization Directives</h3>
                                        <p className="text-xs font-medium text-slate-400 italic">Recalibrate pitch vectors for maximum market impact.</p>
                                    </div>
                                    <BarChart3 className="h-8 w-8 text-indigo-600 opacity-20" />
                                </CardHeader>
                                <CardContent className="p-12 space-y-8">
                                    <div className="space-y-6">
                                        {result.feedback.map((item: string, i: number) => (
                                            <motion.div 
                                                key={i} 
                                                initial={{ opacity: 0, x: 20 }} 
                                                animate={{ opacity: 1, x: 0 }} 
                                                transition={{ delay: 0.1 * i }}
                                                className="flex items-start gap-6 p-8 rounded-[36px] bg-slate-50 hover:bg-indigo-50/30 border border-slate-100/50 transition-all duration-500 group"
                                            >
                                                <div className="mt-1 h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0 group-hover:rotate-12 transition-transform">
                                                    <AlertCircle className="h-5 w-5 text-indigo-500" />
                                                </div>
                                                <p className="text-base font-bold text-slate-700 leading-relaxed italic group-hover:text-slate-900 transition-colors">{item}</p>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <div className="pt-10 border-t border-slate-50">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 italic">Validated Strengths</h4>
                                        <div className="flex flex-wrap gap-4">
                                            {result.strengths.map((str: string, i: number) => (
                                                <Badge key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest gap-3 shadow-sm italic hover:bg-emerald-100 transition-colors">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    {str}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <div className="p-10 bg-slate-50/30 border-t border-slate-50 flex justify-end">
                                    <Button variant="outline" className="h-14 px-10 rounded-[28px] text-[10px] font-black uppercase tracking-widest border-slate-100 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all text-slate-500 shadow-sm gap-2">
                                        Archived Report (PDF) <ArrowRight size={14} />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
}
