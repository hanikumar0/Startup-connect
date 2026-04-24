"use client";

import { useAuthStore } from "@/lib/store";
import CRMBoard from "@/components/crm/CRMBoard";
import CRMStatsWidget from "@/components/crm/CRMStatsWidget";
import { 
    PieChart, 
    Target, 
    Zap, 
    ArrowUpRight,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function CRMPage() {
    const { user } = useAuthStore();
    const role = user?.role?.toLowerCase() as "startup" | "investor" || "startup";
    const isStartup = role === "startup";

    return (
        <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                         <div className="h-12 w-12 rounded-2xl bg-zinc-950 flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                            <Target size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-4xl font-black text-zinc-900 uppercase tracking-tighter italic">
                                    {isStartup ? "Raise Pipeline" : "Deal Management"}
                                </h1>
                                <Badge className="bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest h-6 px-3 italic">PREMIUM</Badge>
                            </div>
                            <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-1">
                                {isStartup ? "Institutional Fundraising & Relationship CRM" : "Startup Sourcing & Investment Deal Flow"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-zinc-50 p-2 rounded-2xl border border-zinc-100">
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-zinc-100">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Velocity</p>
                        <div className="flex items-center gap-2 mt-1">
                            <TrendingUp size={16} className="text-emerald-500" />
                            <span className="text-lg font-black text-zinc-900 tracking-tight">84%</span>
                        </div>
                    </div>
                    <div className="px-4 py-2">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">System Health</p>
                        <div className="flex items-center gap-2 mt-1">
                            <ShieldCheck size={16} className="text-indigo-500" />
                            <span className="text-lg font-black text-zinc-900 tracking-tight uppercase italic text-[14px]">Secure</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <CRMStatsWidget role={role} />
            </motion.section>

            {/* Main Board Area */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/50 backdrop-blur-xl p-6 rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-100"
            >
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight italic">Global Relationship Map</h2>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1 italic">Tactical deployment of capital and network assets</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live Sync Enabled</span>
                    </div>
                </div>

                <CRMBoard role={role} />
            </motion.section>
        </div>
    );
}
