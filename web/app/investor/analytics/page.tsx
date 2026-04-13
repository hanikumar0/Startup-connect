"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Rocket, 
  Wallet, 
  MessageSquare,
  Calendar,
  Zap,
  ArrowUpRight,
  Target,
  FileDown,
  Activity,
  Heart,
  Eye,
  Key,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  PieChart as PieChartIcon
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InvestorAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetch = async () => {
            setLoading(true);
            const res = await apiFetchJSON(`/api/analytics/investor?days=${days}`);
            if (res.success) setData(res);
            setLoading(false);
        };
        fetch();
    }, [days]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#fcfcfd]">
            <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent animate-spin rounded-full" />
        </div>
    );

    return (
        <div className="p-8 lg:p-12 space-y-12 pb-32 min-h-screen bg-[#fcfcfd] italic max-w-7xl mx-auto uppercase tracking-tighter">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Institutional Intelligence</h2>
                    <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Monitor deal flow efficacy & cryptographic contact unlocks
                    </p>
                </div>
                
                <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                    {[7, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-6 h-11 rounded-[0.9rem] text-[10px] font-black tracking-widest transition-all ${
                                days === d ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'
                            }`}
                        >
                            {d} DAYS
                        </button>
                    ))}
                </div>
            </header>

            {/* Global Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Matches Audited", value: data.summary.matchesCount, icon: Target, color: "bg-emerald-600" },
                    { label: "Direct Inquiries", value: data.summary.messagesSent, icon: MessageSquare, color: "bg-blue-600" },
                    { label: "Identity Unlocks", value: data.summary.contactUnlocks, icon: Key, color: "bg-indigo-600" },
                    { label: "Conversion Rate", value: `${Math.round((data.summary.messagesSent / (data.summary.startupsViewed || 1)) * 100)}%`, icon: Activity, color: "bg-slate-900" },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                        <Card className="border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] bg-white p-10 group hover:shadow-2xl transition-all duration-500 border border-slate-50 relative overflow-hidden">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`p-4 rounded-[1.5rem] ${stat.color} text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={26} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] leading-none">{stat.label}</div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none pt-1">{stat.value}</div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Sourcing Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3.5rem] bg-white p-12 relative overflow-hidden border border-slate-100 italic">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 leading-none">Deal Flow Velocity</h3>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] mt-2 italic leading-none">Pipeline auditing across time domains</p>
                        </div>
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] animate-pulse">
                            <PieChartIcon size={24} />
                        </div>
                    </div>
                    <div className="h-[400px]">
                        {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <AreaChart data={data.trend}>
                                    <defs>
                                        <linearGradient id="investorViz" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} hide />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#fff' }} 
                                      itemStyle={{ color: '#059669', fontWeight: 900, textTransform: 'uppercase', fontSize: '9px' }}
                                    />
                                    <Area type="monotone" dataKey="unlocks" stroke="#10b981" strokeWidth={6} fill="url(#investorViz)" dot={{ fill: '#10b981', r: 4 }} />
                                    <Area type="monotone" dataKey="matches" stroke="#6366f1" strokeWidth={3} fill="transparent" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full bg-slate-50 animate-pulse rounded-[2.5rem]" />
                        )}
                    </div>
                </Card>

                <div className="lg:col-span-4 space-y-10">
                    <Card className="border-none shadow-2xl rounded-[3rem] bg-slate-900 text-white p-12 flex flex-col justify-between h-full relative overflow-hidden">
                        <div className="relative z-10 space-y-12">
                             <h4 className="text-xl font-black italic tracking-tighter mb-8 bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent italic leading-none">Deal Engagement Matrix</h4>
                             
                             <div className="space-y-14">
                                {[
                                    { label: 'Outbound Inquiries', value: data.summary.messagesSent, color: 'bg-emerald-400', perc: 85 },
                                    { label: 'Asset Reviews', value: data.summary.startupsViewed, color: 'bg-indigo-400', perc: 100 },
                                    { label: 'Identity Unlocks', value: data.summary.contactUnlocks, color: 'bg-blue-400', perc: 45 },
                                ].map((row, i) => (
                                    <div key={i} className="space-y-5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">{row.label}</span>
                                            <span className="text-3xl font-black italic tracking-tighter text-white">{row.value}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${row.perc}%` }} className={`h-full ${row.color}`} transition={{ duration: 1, delay: 0.5 + i * 0.1 }} />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div className="mt-12 bg-white/5 border border-white/10 rounded-[2.5rem] p-10 relative z-10 backdrop-blur-sm group hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3 mb-5">
                                <TrendingUp size={22} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none">AI Deal Flow Signal</span>
                            </div>
                            <p className="text-sm font-bold text-slate-300 leading-relaxed italic group-hover:text-white transition-colors">
                                Sourcing quality is <span className="text-emerald-400">+22% higher</span> this quarter. Startups in your watchlist are attracting record VC interest globally.
                            </p>
                        </div>
                        <div className="absolute -left-20 -top-20 opacity-[0.03] scale-150 rotate-45 -z-0">
                           <ShieldCheck size={300} />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
