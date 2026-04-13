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
  Activity,
  ShieldCheck,
  Globe,
  Loader2,
  Lock
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetch = async () => {
            try {
                const res = await apiFetchJSON("/api/admin/stats");
                if (res.success) setData(res.stats);
            } catch (err) {
                console.error("Analytics fail", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return (
        <DashboardLayout>
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="animate-spin text-slate-200 h-10 w-10" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Institutional Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Intelligence</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Strategic <span className="text-slate-400 not-italic font-medium">/ Telemetry</span></h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 italic">Real-time Stream</Badge>
                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2 italic text-slate-400 border-slate-200">Global Cluster</Badge>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Active Network", value: data.activeUsersCount, icon: Target, trend: "+12.4%" },
                        { label: "Session Rate", value: "89.4%", icon: Activity, trend: "STABLE" },
                        { label: "Acquisition", value: "+450", icon: Globe, trend: "+5.2%" },
                        { label: "Retention", value: "92%", icon: ShieldCheck, trend: "MAX" },
                    ].map((stat, i) => (
                        <Card key={i} className="border border-slate-100 shadow-sm bg-white overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                                        <stat.icon size={20} />
                                    </div>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">{stat.trend}</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Detailed Intelligence */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <Card className="lg:col-span-8 border border-slate-100 shadow-sm bg-white p-8 rounded-xl overflow-hidden">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest italic">Growth Velocity</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-1">Network expansion telemetry</p>
                            </div>
                            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                               <TrendingUp size={16} />
                            </div>
                        </div>
                        <div className="h-[320px] w-full">
                            {isMounted ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                    <AreaChart data={data.analytics?.usersGrowth || []}>
                                        <defs>
                                            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.05}/>
                                                <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 900}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 700}} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} fill="url(#growthGrad)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
                            )}
                        </div>
                    </Card>

                    <Card className="lg:col-span-4 border-none shadow-lg bg-slate-900 text-white p-8 rounded-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-[11px] font-black text-slate-300 uppercase tracking-widest italic mb-8">Performance Funnel</h3>
                            <div className="space-y-8 mt-12">
                                {[
                                    { label: 'Ingress Leads', count: data.totalUsers, perc: 100, color: 'bg-white' },
                                    { label: 'Validated Nodes', count: data.totalStartups + data.totalInvestors, perc: 74, color: 'bg-slate-400' },
                                    { label: 'Active Clusters', count: data.activeUsersCount, perc: 89, color: 'bg-emerald-400' },
                                ].map((funnel, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{funnel.label}</span>
                                            <span className="text-xl font-black italic tracking-tighter">{funnel.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${funnel.perc}%` }} className={`h-full ${funnel.color}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-12 pt-8 border-t border-white/10">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Sync Reliability</p>
                               <div className="flex items-center gap-2">
                                  <Lock size={12} className="text-emerald-400" />
                                  <span className="text-xl font-black italic tracking-tighter">99.99%</span>
                               </div>
                            </div>
                        </div>
                        <div className="absolute -right-20 -bottom-20 opacity-[0.05] scale-[1.5] rotate-45">
                            <Globe size={400} />
                        </div>
                    </Card>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <Card className="border border-slate-100 shadow-sm bg-white p-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transmission Rate</h4>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-slate-900 italic tracking-tighter">4.2k</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">MSG/SEC</span>
                      </div>
                      <div className="mt-4 flex gap-1 items-end h-8">
                         {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <div key={i} className="flex-1 bg-slate-100 rounded-sm" style={{ height: `${h}%` }} />
                         ))}
                      </div>
                   </Card>
                   <Card className="border border-slate-100 shadow-sm bg-white p-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Cluster Latency</h4>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-slate-900 italic tracking-tighter">24ms</span>
                         <span className="text-[10px] font-bold text-emerald-500 uppercase mb-1">STABLE</span>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-4">Optimized via Edge Cloud Acceleration</p>
                   </Card>
                   <Card className="border border-slate-100 shadow-sm bg-white p-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Neural Scoring</h4>
                      <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-slate-900 italic tracking-tighter">0.98</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">ACCURACY</span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full w-[98%] bg-slate-900 rounded-full" />
                      </div>
                   </Card>
                </div>

            </div>
        </DashboardLayout>
    );
}
