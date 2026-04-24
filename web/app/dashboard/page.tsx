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
  PieChart,
  ChevronRight,
  Sparkles,
  Globe,
  Trophy,
  MapPin
} from "lucide-react";
import { FundingReadinessCard } from "@/components/cards/FundingReadinessCard";
import { TopMatchesWidget } from "@/components/dashboard/TopMatchesWidget";
import { IntroRequestsWidget } from "@/components/dashboard/IntroRequestsWidget";
import CRMStatsWidget from "@/components/crm/CRMStatsWidget";
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
    const [intelItems, setIntelItems] = useState<any[]>([]);


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

            const intelRes = await apiFetchJSON("/api/intelligence/personalized");
            if (intelRes.success) setIntelItems(intelRes.data);
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
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>DASHBOARD</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-slate-600">OVERVIEW</span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                        Welcome back, {user?.name?.split(' ')[0] || "Founders"}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="h-10 px-5 border-slate-200 bg-white font-bold text-[10px] uppercase tracking-widest text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" />
                        Action Required
                    </Badge>
                    <Button className="h-10 px-6 bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
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
                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-md">{stat.tag || 'LIVE'}</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                <h4 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{stat.value}</h4>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* CRM Analytics Integration */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <Target size={12} className="text-indigo-600" /> Pipeline Intelligence
                    </h3>
                    <Link href="/dashboard/crm" className="text-[10px] font-bold text-indigo-600 hover:opacity-70 transition-opacity">View Full CRM</Link>
                </div>
                <CRMStatsWidget role={user?.role?.toLowerCase() as any} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Discovery & Activity Area */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* Secure Data Room Quick Access */}
                    <section className="space-y-6">
                         <div className="flex items-center justify-between px-1">
                             <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <Lock size={12} className="text-indigo-600" /> Secure Data Rooms
                             </h3>
                            <Link href="/dashboard/vdr" className="text-[10px] font-bold text-indigo-600 hover:opacity-70 transition-opacity italic">Open Vault</Link>
                        </div>
                        <Card 
                            className="group rounded-[32px] border-none bg-white shadow-sm hover:shadow-2xl transition-all duration-700 cursor-pointer overflow-hidden border border-slate-50"
                            onClick={() => router.push("/dashboard/vdr")}
                        >
                            <CardContent className="p-8 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <ShieldCheck size={24} className="text-white" />
                                    </div>
                                     <div className="space-y-1">
                                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Go to Data Room</h4>
                                        <p className="text-[13px] font-medium text-slate-400">Securely share and manage files with your partners.</p>
                                    </div>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                    
                    {/* Smart Matches Section (AI Fit Score Rank) */}
                    <TopMatchesWidget role={user?.role?.toLowerCase() || "startup"} />
                    {/* Warm Intro Requests Widget */}
                    <IntroRequestsWidget role={user?.role?.toLowerCase() || "startup"} />

                    {/* Market Intelligence Widgets */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                             <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                                <Sparkles size={12} className="text-indigo-600" /> Market Pulse
                             </h3>
                            <Link href="/dashboard/intelligence" className="text-[10px] font-bold text-indigo-600 hover:opacity-70 transition-opacity">Full Hub</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personalized News/Grants/Events Widget */}
                            <Card className="rounded-[28px] border border-slate-50 bg-white hover:border-indigo-100 transition-all shadow-sm overflow-hidden flex flex-col">
                                 <div className="p-6 bg-slate-50/50 border-b border-slate-50">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isStartup ? "Opportunities & Grants" : "Market & Funding News"}</h4>
                                </div>
                                <div className="p-2 space-y-1">
                                    {intelItems.length > 0 ? intelItems.slice(0, 3).map((item, i) => (
                                        <div key={i} className="p-4 hover:bg-slate-50 transition-all rounded-2xl flex items-start gap-4 group cursor-pointer" onClick={() => router.push('/dashboard/intelligence')}>
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                                                {item.type === 'grant' || item.type === 'accelerator' ? <Trophy size={16} /> : <Globe size={16} />}
                                            </div>
                                             <div className="space-y-1">
                                                <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">via {item.source || "Ecosystem"}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-[10px] font-bold text-slate-300 italic uppercase">Scanning for opportunities...</div>
                                    )}
                                </div>
                            </Card>

                            <Card className="rounded-[28px] border border-slate-50 bg-white hover:border-indigo-100 transition-all shadow-sm overflow-hidden flex flex-col">
                                 <div className="p-6 bg-slate-50/50 border-b border-slate-50">
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isStartup ? "Workshops & Pitching" : "Trending Events"}</h4>
                                </div>
                                <div className="p-2 space-y-1">
                                    {intelItems.filter(i => ['event', 'workshop'].includes(i.type)).length > 0 ? intelItems.filter(i => ['event', 'workshop'].includes(i.type)).slice(0, 3).map((item, i) => (
                                        <div key={i} className="p-4 hover:bg-slate-50 transition-all rounded-2xl flex items-start gap-4 group cursor-pointer" onClick={() => router.push('/dashboard/intelligence')}>
                                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-sm text-purple-600 group-hover:scale-110 transition-transform">
                                                <Calendar size={16} />
                                            </div>
                                             <div className="space-y-1">
                                                <p className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300 uppercase">
                                                    <MapPin size={10} /> {item.location || (item.isOnline ? "Online" : "Global")}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-[10px] font-bold text-slate-300 italic uppercase">No upcoming events found</div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </section>


                    {/* Recent Activity */}
                    <section className="space-y-6">
                         <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">Recent Activity</h3>
                        <Card className="rounded-[32px] border border-slate-50 bg-white shadow-sm">
                            <CardContent className="p-16 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                                    <Activity size={24} />
                                </div>
                                 <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No activity yet</p>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Authority Sidebar */}
                <aside className="lg:col-span-4 space-y-8">
                    
                    {/* NEW: AI Funding Readiness Score */}
                    {isStartup && <FundingReadinessCard />}

                    {/* Verification Card */}
                    <Card className="rounded-[32px] border-none shadow-xl bg-indigo-600 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                            <ShieldCheck size={180} />
                        </div>
                        <CardContent className="p-10 space-y-8 relative z-10">
                             <div className="space-y-3">
                                <h3 className="text-2xl font-bold tracking-tight">Verification</h3>
                                <p className="text-[13px] text-indigo-100 leading-relaxed font-medium opacity-80">
                                    Complete E-KYC to unlock premium {isStartup ? 'investor' : 'startup'} matching and institutional visibility.
                                </p>
                            </div>
                             <Button 
                                onClick={() => router.push('/dashboard/settings/verification')}
                                className="w-full h-14 bg-white text-indigo-600 font-bold text-[11px] uppercase tracking-wider rounded-2xl hover:bg-slate-50 shadow-lg shadow-indigo-900/20"
                            >
                                Start E-KYC
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Meetings */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                              <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800">Meetings</h3>
                              <span className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">0</span>
                        </div>
                        <div className="p-10 rounded-[32px] border border-slate-50 bg-white shadow-sm text-center">
                               <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">No meetings scheduled</p>
                        </div>
                    </section>

                    {/* AI Insights Card */}
                    <Card className="rounded-[32px] border-none bg-slate-900 text-white overflow-hidden ring-1 ring-white/5">
                        <CardContent className="p-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400">
                                    <BrainCircuit size={18} />
                                </div>
                                 <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Insights</span>
                            </div>
                             <p className="text-[13px] text-slate-400 leading-relaxed font-medium opacity-90">
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
