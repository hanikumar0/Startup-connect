"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowUpRight, 
  Target, 
  ShieldCheck, 
  Calendar, 
  MessageSquare,
  Activity,
  Zap,
  TrendingUp,
  Users,
  Briefcase,
  BrainCircuit,
  Lock,
  Loader2,
  FileText,
  BarChart3,
  PieChart
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetchJSON } from "@/lib/api";

export default function UnifiedDashboard() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isStartup = user?.role?.toLowerCase() === "startup";

    useEffect(() => {
        if (user) {
            initDashboard();
        }
    }, [user]);

    const initDashboard = async () => {
        setIsLoading(true);
        try {
            const [statsRes, matchRes] = await Promise.all([
                apiFetchJSON("/api/users/stats"),
                apiFetchJSON("/api/match/me")
            ]);
            
            if (statsRes.success) setStats(statsRes.stats);
            if (matchRes.success) setMatches(matchRes.data || []);
        } catch (err) {
            console.error("Dashboard init fail", err);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (name: any) => {
        if (!name) return Activity;
        if (typeof name !== 'string') return name;
        switch (name) {
            case 'Activity': return Activity;
            case 'Target': return Target;
            case 'Users': return Users;
            case 'Calendar': return Calendar;
            case 'Briefcase': return Briefcase;
            case 'Zap': return Zap;
            case 'BarChart3': return BarChart3;
            case 'PieChart': return PieChart;
            case 'TrendingUp': return TrendingUp;
            case 'MessageSquare': return MessageSquare;
            default: return Activity;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const displayStats = stats.length > 0 ? stats : [
        { label: isStartup ? 'PROFILE VIEWS' : 'TOTAL INVESTED', value: isStartup ? '0' : '₹0.0Cr', icon: isStartup ? Activity : Briefcase, tag: isStartup ? 'PORTFOLIO' : 'PORTFOLIO', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: isStartup ? 'ACTIVE MATCHES' : 'ACTIVE DEALS', value: '0', icon: isStartup ? Target : Zap, tag: 'IN PIPELINE', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'NEW MATCHES', value: '0', icon: Users, tag: 'RECENT', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'SCHEDULED', value: '0', icon: Calendar, tag: 'THIS WEEK', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700">
            
            {/* Professional Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span>DASHBOARD</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-600">OVERVIEW</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Welcome back, {user?.name?.split(' ')[0] || "Founders"}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="h-10 px-5 border-slate-200 bg-white font-bold text-[10px] uppercase tracking-widest text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" />
                        Action Required
                    </Badge>
                    <Button className="h-10 px-6 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                        Share Profile
                    </Button>
                </div>
            </header>

            {/* Premium Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayStats.map((stat: any, i) => {
                    const Icon = getIcon(stat.icon);
                    return (
                        <Card key={i} className="rounded-[24px] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                            <CardContent className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`h-12 w-12 rounded-2xl ${stat.bg || 'bg-slate-50'} flex items-center justify-center ${stat.color || 'text-slate-600'}`}>
                                        <Icon size={20} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md">{stat.tag || 'LIVE'}</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Discovery & Activity Area */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Smart Matches Section */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Smart Matches</h3>
                            <Link href="/dashboard/matches" className="text-[10px] font-bold text-indigo-600 hover:opacity-70 transition-opacity">View all</Link>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(matches.length > 0 ? matches : [
                                { label: 'Lead Investor', type: 'VC', score: 90 },
                                { label: 'Lead Investor', type: 'VC', score: 70 },
                            ]).slice(0, 2).map((match: any, i) => (
                                <Card key={i} className="rounded-[28px] border border-slate-50 bg-white hover:border-indigo-100 transition-all cursor-pointer group shadow-sm hover:shadow-lg">
                                    <CardContent className="p-8 relative">
                                        <div className="absolute top-8 right-8 text-slate-200 group-hover:text-indigo-600 transition-colors">
                                            <ArrowUpRight size={18} />
                                        </div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md">
                                                {match.score || 50}% Match
                                            </Badge>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{match.startup?.name || match.investor?.firm || match.label}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-80">{match.startup?.industry || match.investor?.type || match.type}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Recent Activity */}
                    <section className="space-y-6">
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Recent Activity</h3>
                        <Card className="rounded-[32px] border border-slate-50 bg-white shadow-sm">
                            <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                    <Activity size={24} />
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">System logs will appear here</p>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Authority Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    
                    {/* Verification Card */}
                    <Card className="rounded-[32px] border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <ShieldCheck size={180} />
                        </div>
                        <CardContent className="p-10 space-y-8 relative z-10">
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black tracking-tight">Verification</h3>
                                <p className="text-xs text-indigo-100 leading-relaxed font-medium opacity-80">
                                    Complete E-KYC to unlock premium {isStartup ? 'investor' : 'startup'} matching and institutional visibility.
                                </p>
                            </div>
                            <Button 
                                onClick={() => router.push('/dashboard/settings/verification')}
                                className="w-full h-14 bg-white text-indigo-600 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 shadow-lg shadow-indigo-900/20"
                            >
                                Start E-KYC
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Meetings */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800">Meetings</h3>
                             <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">0</span>
                        </div>
                        <div className="p-10 rounded-[32px] border border-slate-50 bg-white shadow-sm text-center">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No meetings scheduled</p>
                        </div>
                    </section>

                    {/* AI Insights Card */}
                    <Card className="rounded-[32px] border-none bg-slate-900 text-white overflow-hidden ring-1 ring-white/5">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400">
                                    <BrainCircuit size={18} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Outreach Intel</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic opacity-90">
                                {isStartup 
                                    ? "Your pitch deck is receiving high conversion from Fintech focused VCs. Use these insights to optimize your outreach."
                                    : "Early-stage SaaS deals in your pipeline are showing 40% higher growth velocity than market average."}
                            </p>
                        </CardContent>
                    </Card>
                </aside>

            </div>
        </div>
    );
}
