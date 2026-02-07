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
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

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
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100">
                        <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Pitch Coach</h1>
                </div>
                <p className="text-slate-500">Practice your elevator pitch and get instant investor readiness feedback.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-12">
                    <Card className="border-none shadow-xl bg-white overflow-hidden ring-1 ring-slate-100">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-indigo-600" />
                                Elevator Pitch Drafter
                            </CardTitle>
                            <CardDescription>Paste your one-paragraph pitch here (problem, solution, and market).</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <Textarea
                                placeholder="Example: We are building a decentralized energy marketplace for EV charging stations..."
                                className="min-h-[200px] text-lg bg-slate-50 border-none focus-visible:ring-indigo-500 rounded-2xl p-6 resize-none"
                                value={pitch}
                                onChange={(e) => setPitch(e.target.value)}
                            />
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    {pitch.split(/\s+/).filter(Boolean).length} Words
                                </div>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !pitch.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 px-8 h-12 rounded-xl shadow-lg shadow-indigo-100 transition-all font-bold gap-2"
                                >
                                    {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Analyze with AI
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                {result && (
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-6 animate-in slide-in-from-bottom-6 duration-700">
                        {/* Score Card */}
                        <Card className="md:col-span-4 border-none shadow-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white overflow-hidden">
                            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                                <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">Readiness Score</p>
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="opacity-20"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={364}
                                            strokeDashoffset={364 - (364 * result.score) / 100}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl font-black">{Math.round(result.score)}%</span>
                                    </div>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-2 w-full">
                                    <Badge className={`${result.has_edge ? "bg-emerald-500/20" : "bg-red-400/20"} text-white border-none px-2 py-1 text-[9px] flex items-center justify-center`}>
                                        {result.has_edge ? "✓ Edge Detected" : "✗ No Edge"}
                                    </Badge>
                                    <Badge className={`${result.has_revenue ? "bg-emerald-500/20" : "bg-red-400/20"} text-white border-none px-2 py-1 text-[9px] flex items-center justify-center`}>
                                        {result.has_revenue ? "✓ Revenue Model" : "✗ No Revenue"}
                                    </Badge>
                                    <div className="col-span-2 mt-2 pt-2 border-t border-white/10">
                                        <p className="text-[10px] font-bold uppercase opacity-60 mb-1">Coach Sentiment</p>
                                        <p className="text-xs font-medium italic">
                                            {result.score > 70 ? "Investors will find this compelling." : "Needs more structural clarity."}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feedback Detail */}
                        <div className="md:col-span-8 space-y-6">
                            <Card className="border-none shadow-sm bg-white ring-1 ring-slate-100 h-full">
                                <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg font-bold">Improvement Areas</CardTitle>
                                    <BarChart3 className="h-5 w-5 text-indigo-600" />
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {result.feedback.map((item: string, i: number) => (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 group hover:bg-slate-100 transition-colors">
                                                <div className="mt-0.5 h-6 w-6 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm shrink-0">
                                                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{item}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 border-t border-slate-50 pt-6">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Detected Strengths</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {result.strengths.map((str: string, i: number) => (
                                                <Badge key={i} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1.5 font-bold gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    {str}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
