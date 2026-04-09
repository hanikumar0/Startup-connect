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
  Video
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

export default function StartupAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const res = await apiFetchJSON(`/api/analytics/startup?days=${days}`);
            if (res.success) setData(res);
            setLoading(false);
        };
        fetch();
    }, [days]);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#fcfcfd]">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent animate-spin rounded-full" />
        </div>
    );

    return (
        <div className="p-8 lg:p-12 space-y-12 pb-32 min-h-screen bg-[#fcfcfd] italic max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 leading-none italic uppercase">Venture Telemetry</h2>
                    <p className="text-slate-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Quantify your fundraising momentum & investor engagement
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

            {/* Core KPI Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Exposure", value: data.summary.profileViews, icon: Eye, color: "bg-indigo-600" },
                    { label: "Interest Buffer", value: data.summary.savedCount, icon: Heart, color: "bg-rose-500" },
                    { label: "Bridge Comms", value: data.summary.messagesReceived, icon: MessageSquare, color: "bg-emerald-500" },
                    { label: "Closing Ratio", value: `${Math.round((data.summary.meetingsBooked / (data.summary.profileViews || 1)) * 100)}%`, icon: Target, color: "bg-indigo-900" },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                        <Card className="border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] bg-white p-8 group hover:shadow-2xl transition-all duration-500 border border-slate-50">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                                    <stat.icon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em] leading-none">{stat.label}</div>
                                    <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{stat.value}</div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Deep Engagement Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3.5rem] bg-indigo-600 p-12 relative overflow-hidden text-white">
                    <div className="relative z-10">
                         <div className="flex justify-between items-start mb-12">
                            <div>
                                <h3 className="text-3xl font-black italic tracking-tighter leading-none">Exposure Velocity</h3>
                                <p className="text-indigo-200/60 font-bold uppercase tracking-[0.2em] text-[9px] mt-2 italic">Institutional flow aggregation</p>
                            </div>
                            <Badge className="bg-white/20 text-white rounded-full font-black text-[10px] tracking-widest px-5 border-none backdrop-blur-md">REAL-TIME TELEMETRY</Badge>
                         </div>
                         <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <AreaChart data={data.trend}>
                                    <defs>
                                        <linearGradient id="startupViz" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#fff" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#fff" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#c7d2fe', fontSize: 10, fontWeight: 900}} dy={20} />
                                    <YAxis axisLine={false} tickLine={false} hide />
                                    <Tooltip 
                                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)', background: '#1e1b4b', color: '#fff' }} 
                                      itemStyle={{ color: '#818cf8', fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                                    />
                                    <Area type="monotone" dataKey="views" stroke="#fff" strokeWidth={5} fill="url(#startupViz)" />
                                </AreaChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 opacity-5 transform scale-[2] rotate-12 -z-0">
                        <BarChart3 size={400} />
                    </div>
                </Card>

                <div className="lg:col-span-4 space-y-10">
                    <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10 flex flex-col justify-between h-full border border-slate-100">
                        <div className="space-y-10">
                             <h4 className="text-xl font-black italic tracking-tighter text-slate-900 leading-none">Deal Funnel</h4>
                             
                             <div className="space-y-12">
                                {[
                                    { label: 'Asset Downloads', value: data.summary.pitchDownloads, color: 'bg-indigo-600', max: 50 },
                                    { label: 'Strategic Meetings', value: data.summary.meetingsBooked, color: 'bg-emerald-600', max: 10 },
                                    { label: 'Match Conversions', value: data.summary.matchClicks, color: 'bg-violet-600', max: 30 },
                                ].map((step, i) => (
                                    <div key={i} className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{step.label}</span>
                                            <span className="text-2xl font-black italic tracking-tighter text-slate-900">{step.value}</span>
                                        </div>
                                        <div className="h-3 bg-slate-50 rounded-full overflow-hidden shadow-inner flex">
                                            <motion.div 
                                                initial={{ width: 0 }} 
                                                animate={{ width: `${Math.min((step.value / step.max) * 100, 100)}%` }} 
                                                className={`h-full rounded-full ${step.color} shadow-lg`}
                                                transition={{ duration: 1.5, delay: i * 0.2 }}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>

                        <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap size={20} className="text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Elite Prediction</span>
                            </div>
                            <p className="text-sm font-black italic leading-relaxed">
                                Strategy alert: Your pitch deck engagement is <span className="text-emerald-400">+14%</span> above segment average this month.
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
