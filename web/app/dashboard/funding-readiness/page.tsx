
"use client";

import { useEffect, useState } from "react";
import { 
    Zap, 
    Trophy, 
    TrendingUp, 
    BarChart3, 
    PieChart, 
    Users, 
    ChevronRight, 
    Loader2, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    ArrowLeft,
    Target,
    ShieldCheck,
    Briefcase,
    Layout,
    Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetchJSON } from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

export default function FundingReadinessDetail() {
    const router = useRouter();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const score = data?.score || 0;
    const stage = data?.stage || "Not Ready";

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.back()}
                        className="p-0 hover:bg-transparent text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft size={12} className="mr-2" /> Back to Dashboard
                    </Button>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Funding Readiness Report</h1>
                    <p className="text-[13px] font-medium text-slate-400">AI-powered analysis of your investment potential.</p>
                </div>
                <Badge className="h-10 px-6 bg-slate-900 text-white font-bold text-[12px] uppercase tracking-widest border-none">
                    {stage}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score Overview Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-[32px] border-none bg-indigo-600 text-white overflow-hidden shadow-2xl">
                        <CardContent className="p-10 space-y-6 text-center">
                            <div className="relative h-32 w-32 mx-auto flex items-center justify-center">
                                <svg className="absolute inset-0 h-full w-full -rotate-90">
                                    <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                                    <circle 
                                        cx="64" cy="64" r="58" fill="transparent" stroke="white" strokeWidth="8" 
                                        strokeDasharray={Math.PI * 116} 
                                        strokeDashoffset={Math.PI * 116 * (1 - score / 100)} 
                                        strokeLinecap="round" 
                                    />
                                </svg>
                                <span className="text-4xl font-black">{score}</span>
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold">Overall Rating</h2>
                                <p className="text-indigo-100 text-[12px] opacity-80">Calculated across 5 key verticals</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border-none bg-white shadow-sm p-8 space-y-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-4">Key Insights</h3>
                        <div className="space-y-4">
                            {data?.reasons?.map((r: string, i: number) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 mt-0.5">
                                        <CheckCircle2 size={12} />
                                    </div>
                                    <p className="text-[13px] font-medium text-slate-600 leading-snug">{r}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="rounded-[32px] border-none bg-amber-50 shadow-sm p-8 space-y-6">
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-amber-600 border-b border-amber-100 pb-4">Priority Actions</h3>
                        <div className="space-y-4">
                            {data?.suggestions?.map((s: string, i: number) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0 mt-0.5 font-bold text-[10px]">
                                        {i + 1}
                                    </div>
                                    <p className="text-[13px] font-bold text-amber-900 leading-snug">{s}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Vertical Breakdown Table */}
                <div className="lg:col-span-8">
                    <Card className="rounded-[40px] border-none bg-white shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                        <Tabs defaultValue="profile" className="flex-1 flex flex-col">
                            <CardHeader className="px-10 pt-10 border-b border-slate-50">
                                <TabsList className="bg-slate-50 p-1.5 rounded-2xl h-14 w-full justify-start gap-2">
                                    <TabsTrigger value="profile" className="rounded-xl px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Profile</TabsTrigger>
                                    <TabsTrigger value="traction" className="rounded-xl px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Traction</TabsTrigger>
                                    <TabsTrigger value="team" className="rounded-xl px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Team</TabsTrigger>
                                    <TabsTrigger value="deck" className="rounded-xl px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Deck</TabsTrigger>
                                    <TabsTrigger value="metrics" className="rounded-xl px-6 font-bold text-[11px] uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">Metrics</TabsTrigger>
                                </TabsList>
                            </CardHeader>
                            
                            <div className="p-10 flex-1">
                                <TabsContent value="profile" className="mt-0 space-y-10 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-slate-900">Profile Completeness</h4>
                                            <p className="text-[13px] text-slate-400 font-medium font-medium">How well is your story told?</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-indigo-600">{data?.breakdown?.profile || 0}/20</span>
                                        </div>
                                    </div>
                                    <Progress value={(data?.breakdown?.profile / 20) * 100} className="h-3 rounded-full bg-slate-50" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                         <div className="p-6 rounded-3xl border border-slate-50 bg-slate-50/30 space-y-3">
                                            <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                                <Layout size={20} />
                                            </div>
                                            <h5 className="font-bold text-slate-800">Visual Assets</h5>
                                            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Logos and cover images increase conversion by 40%.</p>
                                         </div>
                                         <div className="p-6 rounded-3xl border border-slate-50 bg-slate-50/30 space-y-3">
                                            <div className="h-10 w-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-indigo-600">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <h5 className="font-bold text-slate-800">Verification</h5>
                                            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">Trusted accounts receive priority matching.</p>
                                         </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="traction" className="mt-0 space-y-10 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-slate-900">Market Traction</h4>
                                            <p className="text-[13px] text-slate-400 font-medium">Usage, growth, and customer signals.</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-emerald-600">{data?.breakdown?.traction || 0}/25</span>
                                        </div>
                                    </div>
                                    <Progress value={(data?.breakdown?.traction / 25) * 100} className="h-3 rounded-full bg-slate-50" />
                                    <div className="p-10 border border-slate-100 rounded-[32px] bg-slate-50/50 text-center space-y-4">
                                        <Trophy className="mx-auto text-emerald-500 h-10 w-10" />
                                        <h5 className="font-bold text-slate-800">PMF Milestone</h5>
                                        <p className="text-[13px] text-slate-500 font-medium max-w-sm mx-auto">Your growth trajectory matches the top 10% of startups in our seed-stage database.</p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="team" className="mt-0 space-y-10 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-slate-900">Founder & Team Signal</h4>
                                            <p className="text-[13px] text-slate-400 font-medium">Evaluation of technical and business competence.</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-blue-600">{data?.breakdown?.team || 0}/20</span>
                                        </div>
                                    </div>
                                    <Progress value={(data?.breakdown?.team / 20) * 100} className="h-3 rounded-full bg-slate-50" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-8 bg-blue-50/50 rounded-[28px] border border-blue-50">
                                            <h6 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Technical Gap</h6>
                                            <p className="text-lg font-bold text-blue-900">None Detected</p>
                                        </div>
                                        <div className="p-8 bg-slate-50 rounded-[28px] border border-slate-100">
                                            <h6 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Social Proof</h6>
                                            <p className="text-lg font-bold text-slate-800">Linked Profiles Active</p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="deck" className="mt-0 space-y-10 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-slate-900">Investment Collateral</h4>
                                            <p className="text-[13px] text-slate-400 font-medium">Pitch deck, financial plans, and business model.</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-purple-600">{data?.breakdown?.deck || 0}/20</span>
                                        </div>
                                    </div>
                                    <Progress value={(data?.breakdown?.deck / 20) * 100} className="h-3 rounded-full bg-slate-50" />
                                    <div className="p-10 border-2 border-dashed border-slate-100 rounded-[32px] bg-white flex flex-col items-center justify-center space-y-6">
                                        <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                                            <Briefcase size={32} />
                                        </div>
                                        <div className="text-center">
                                            <h5 className="font-bold text-slate-800">Unlock Full Deck Analysis</h5>
                                            <p className="text-xs text-slate-400 font-medium mt-1">Upgrade to Premium to visualize pitch deck heatmaps.</p>
                                        </div>
                                        <Button className="bg-slate-900 text-white rounded-xl h-12 px-8 font-bold">Learn More</Button>
                                    </div>
                                </TabsContent>

                                <TabsContent value="metrics" className="mt-0 space-y-10 animate-in fade-in duration-500">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-2xl font-black text-slate-900">Unit Economics</h4>
                                            <p className="text-[13px] text-slate-400 font-medium">LTV, CAC, Burn, and Runway analysis.</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-amber-500">{data?.breakdown?.metrics || 0}/15</span>
                                        </div>
                                    </div>
                                    <Progress value={(data?.breakdown?.metrics / 15) * 100} className="h-3 rounded-full bg-slate-50" />
                                    <div className="grid grid-cols-1 gap-4">
                                        <Card className="rounded-[24px] border border-slate-50 shadow-none bg-slate-50/30 p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-amber-500">
                                                    <Activity size={18} />
                                                </div>
                                                <span className="font-bold text-slate-700">Financial Transparency</span>
                                            </div>
                                            <Badge className="bg-white text-slate-400 border-slate-100">Pending Update</Badge>
                                        </Card>
                                        <Card className="rounded-[24px] border border-slate-50 shadow-none bg-slate-50/30 p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-amber-500">
                                                    <BarChart3 size={18} />
                                                </div>
                                                <span className="font-bold text-slate-700">Revenue Velocity</span>
                                            </div>
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none">Excellent</Badge>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </div>
    );
}
