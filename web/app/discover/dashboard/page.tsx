"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import DiscoveryStats from "@/components/discover/DiscoveryStats";
import SmartMatchSection from "@/components/discover/SmartMatchSection";
import ExternalDiscoverySection from "@/components/discover/ExternalDiscoverySection";
import { useAuthStore } from "@/lib/store";
import { Search, Filter, SlidersHorizontal, ArrowRight, Zap, Globe, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { apiFetchJSON } from "@/lib/api";
import { useEffect } from "react";

export default function DiscoveryDashboard() {
  const { user } = useAuthStore();
  const [activeMode, setActiveMode] = useState<"internal" | "external">("internal");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    industry: "All",
    location: "",
    stage: "All"
  });
  const [stats, setStats] = useState({
    totalMatches: 0,
    connectionRequests: 0,
    acceptedConnections: 0,
    meetingsScheduled: 0,
    outreachSent: 0,
    dailyOutreachCount: 0,
    dailyLimit: 20
  });

  const fetchStats = async () => {
    try {
      const data = await apiFetchJSON("/api/discover/stats");
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error("Stats fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        {/* Header Section */}
        <section className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <motion.h1 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-extrabold text-slate-900 tracking-tight"
                    >
                        Discover <span className="text-primary tracking-tighter italic">Opportunities</span>
                    </motion.h1>
                    <p className="text-slate-500 font-medium">
                        Explore potential partners through our proprietary network and global lead system.
                    </p>
                </div>

                {/* Discovery Toggle Switch */}
                <div className="bg-slate-100/80 p-1.5 rounded-2xl flex items-center border border-slate-200/50 shadow-inner">
                    <button 
                        onClick={() => setActiveMode("internal")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                            activeMode === "internal" ? "bg-white text-primary shadow-lg shadow-primary/5" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Zap size={14} fill={activeMode === "internal" ? "currentColor" : "none"} />
                        Smart Matches
                        <Badge variant="outline" className="ml-1 bg-primary/5 text-primary border-primary/10 text-[8px] px-1 py-0 h-4">AI</Badge>
                    </button>
                    <button 
                        onClick={() => setActiveMode("external")}
                        className={cn(
                            "px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2",
                            activeMode === "external" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Globe size={14} />
                        External Leads
                        <Badge variant="outline" className="ml-1 bg-white/10 text-emerald-100 border-white/20 text-[8px] px-1 py-0 h-4 uppercase">External</Badge>
                    </button>
                </div>
            </div>

            {/* Global Filter Bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-all" size={18} />
                    <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, firm, or focus..." 
                        className="h-12 pl-12 bg-transparent border-none focus-visible:ring-0 text-slate-900 font-medium placeholder:text-slate-400" 
                    />
                </div>
                <div className="h-8 w-px bg-slate-200 hidden md:block" />
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <select 
                        className="h-10 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                        value={filters.industry}
                        onChange={(e) => setFilters(f => ({ ...f, industry: e.target.value }))}
                    >
                        <option>All Industries</option>
                        <option>Fintech</option>
                        <option>AI</option>
                        <option>Healthtech</option>
                        <option>SaaS</option>
                    </select>
                    <div className="relative">
                        <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input 
                            value={filters.location}
                            onChange={(e) => setFilters(f => ({ ...f, location: e.target.value }))}
                            placeholder="Location" 
                            className="h-10 pl-9 w-32 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold" 
                        />
                    </div>
                    <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-200 shrink-0">
                        <SlidersHorizontal size={16} />
                    </Button>
                </div>
            </div>

            <DiscoveryStats stats={stats} />
        </section>

        {/* Dynamic Section Rendering */}
        <AnimatePresence mode="wait">
            {activeMode === "internal" ? (
                <motion.section 
                    key="internal"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    className="bg-slate-50/50 -mx-6 px-6 py-12 rounded-[3.5rem] border border-slate-100"
                >
                    <SmartMatchSection 
                        userRole={(user?.role as any) || "startup"} 
                        search={search}
                        filters={filters}
                        onActionTaken={refreshStats}
                    />
                </motion.section>
            ) : (
                <motion.section 
                    key="external"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                >
                    <ExternalDiscoverySection 
                        stats={stats} 
                        search={search}
                        filters={filters}
                        onOutreachSent={refreshStats}
                    />
                </motion.section>
            )}
        </AnimatePresence>


        {/* Global Footer (Visible for both) */}
        <section className="bg-slate-900 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-primary h-64 w-64 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="space-y-4 relative z-10">
                <h3 className="text-3xl font-bold tracking-tight">Need help with Discovery?</h3>
                <p className="text-slate-400 font-medium max-w-md">
                    Our team can help you identify and outreach to the best candidates manually for specialized institutional needs.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
                <Button className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-white text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                    Contact Specialist
                </Button>
            </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

