"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Database, 
  Server, 
  TrendingUp,
  Search,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalConnections: 12, // fallback/mock
    totalStartups: 0,
    totalInvestors: 0,
    pendingVerifications: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiFetch("/api/admin/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Admin stats fetch failed", error);
    }
  };

  const metrics = [
    { label: "Accounts", value: stats.totalUsers, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Network", value: stats.totalConnections, icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Startups", value: stats.totalStartups, icon: Database, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Capital", value: stats.totalInvestors, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-4">
      {/* Dense Subheader Toolbar */}
      <div className="flex items-center justify-between py-1 border-b border-slate-50">
        <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Platform Admin</h2>
            <Badge className="bg-slate-900 text-white border-none text-[8px] font-black px-1.5 h-4 mb-0.5">V3.0 Stable</Badge>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="h-7 px-3 rounded-md text-[9px] font-black uppercase tracking-widest border-slate-100 text-slate-400">Export CSV</Button>
            <Button className="h-7 px-3 rounded-md text-[9px] font-black uppercase tracking-widest bg-indigo-600 text-white">System Logs</Button>
        </div>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm group hover:border-indigo-100 transition-all">
            <div className="flex items-center justify-between mb-2">
               <div className={`h-7 w-7 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
                 <m.icon size={14} />
               </div>
               <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
               <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{m.value}</h4>
               <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">+12%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="border-slate-100 shadow-sm rounded-xl bg-white overflow-hidden">
             <div className="p-3 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Global Data Pipeline</h3>
                <div className="flex items-center gap-2">
                   <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-3/4 animate-pulse" />
                   </div>
                   <span className="text-[8px] font-black text-indigo-600 uppercase">Active</span>
                </div>
             </div>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <Database size={14} />
                           </div>
                           <div>
                              <p className="text-[11px] font-bold text-slate-900 leading-none mb-1">Shard Node Cluster #{i}</p>
                              <p className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Status: Synchronized • Region: Global</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                           <ChevronRight size={14} />
                        </Button>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="space-y-3">
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xl shadow-slate-200">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                   <Server size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">System Engine</h3>
             </div>
             <div className="space-y-3">
                {[
                  { label: "API Latency", status: "Optimal", color: "text-emerald-400" },
                  { label: "Core Services", status: "Healthy", color: "text-emerald-400" },
                  { label: "Database", status: "Syncing", color: "text-amber-400" }
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                     <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">{item.label}</span>
                     <span className={`text-[9.5px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                  </div>
                ))}
             </div>
             <Button className="w-full mt-4 h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Hard Reboot</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
