"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp,
    DollarSign,
    Briefcase,
    PieChart,
    ArrowUpRight,
    Building2,
    Calendar,
    Target,
    ChevronRight,
    ArrowRight,
    Zap,
    CircleDashed,
    Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function PortfolioPage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <CircleDashed className="h-12 w-12 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Loading Portfolio...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 px-1"
        >
            {/* Breadcrumb Console */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Institutional Asset Hub</span>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Investment Portfolio</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">
                        ASSETS<span className="text-indigo-600">.</span>HUB
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic max-w-xl">
                        Monitor active capital deployment, exit vectors, and institutional deal health.
                    </p>
                </div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        className="h-16 px-8 bg-black hover:bg-slate-900 text-white rounded-[28px] shadow-2xl shadow-indigo-200 gap-3 border-none ring-offset-4 hover:ring-2 ring-black transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="font-bold text-lg">DEPLOY CAPITAL</span>
                    </Button>
                </motion.div>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Committed", value: "$0.00", icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+0.0%" },
                    { label: "Active Deployments", value: "0", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", trend: "HEALTHY" },
                    { label: "Exit Multiplier", value: "0.0x", icon: Target, color: "text-amber-600", bg: "bg-amber-50", trend: "0.0x AVG" },
                    { label: "Deal Pipeline", value: "0", icon: PieChart, color: "text-purple-600", bg: "bg-purple-50", trend: "0 NEW" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="rounded-[40px] border-none shadow-sm hover:shadow-xl transition-all duration-500 group bg-white/50 backdrop-blur-sm border border-slate-50 overflow-hidden">
                            <CardContent className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`h-14 w-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                                        <stat.icon size={28} />
                                    </div>
                                    <Badge className={`${stat.bg} ${stat.color} border-none font-black text-[9px] px-3`}>{stat.trend}</Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic opacity-70">{stat.label}</p>
                                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Asset Monitoring Console */}
            <Card className="rounded-[56px] border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-50">
                <CardHeader className="p-12 border-b border-slate-50">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">Live Asset Monitor</span>
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">ACTIVE DEPLOYMENTS</h2>
                            <p className="text-sm text-slate-500 font-medium italic">Monitor real-time performance of your high-velocity capital assets.</p>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                            Export Institutional Report (PDF/CSV)
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/30">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner"
                        >
                            <Briefcase className="h-10 w-10 text-slate-200" strokeWidth={1.5} />
                        </motion.div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Repository Empty</h3>
                        <p className="text-slate-500 max-w-sm mt-2 font-medium italic">
                            Zero active deployments detected in your current institutional cycle.
                        </p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                                className="mt-8 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex gap-2"
                            >
                                Enter Discovery Console <ArrowRight size={14} strokeWidth={3} />
                            </Button>
                        </motion.div>
                    </div>
                </CardContent>
            </Card>

            {/* Sub-Consoles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[48px] border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-50">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <Calendar className="text-indigo-600" size={20} />
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Institutional Schedule</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col items-center justify-center border border-dashed border-slate-200 text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Zero Upcoming Events</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="rounded-[48px] border-none shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm border border-slate-50">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <Zap className="text-amber-500" size={20} />
                            <CardTitle className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Asset Signals</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="p-8 bg-slate-50 rounded-[32px] flex flex-col items-center justify-center border border-dashed border-slate-200 text-center">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Awaiting Market Intelligence</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
