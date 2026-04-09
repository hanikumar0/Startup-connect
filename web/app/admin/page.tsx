"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Rocket, 
  Wallet, 
  TrendingUp, 
  Search, 
  Bell, 
  ArrowUpRight, 
  Calendar,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  Activity,
  CheckCircle2,
  ChevronRight,
  Filter,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetchJSON } from "@/lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await apiFetchJSON("/api/admin/stats");
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        
        {/* Governance Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-primary" />
              <span>Platform Governance</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="h-10 pl-9 pr-4 w-64 bg-slate-50 border border-slate-200 rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 relative">
              <Bell size={18} className="text-slate-600" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white" />
            </Button>
            <Button className="bg-primary text-white h-10 px-4 text-xs font-bold uppercase">System Reports</Button>
          </div>
        </header>

        {/* Global Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Network", value: stats?.totalUsers || 0, icon: Users, trend: "+12.5%", color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Elite Startups", value: stats?.totalStartups || 0, icon: Rocket, trend: "+4.2%", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Verified Partners", value: stats?.totalInvestors || 0, icon: Wallet, trend: "+8.9%", color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Security Queue", value: stats?.activeReports || 0, icon: AlertCircle, trend: "Stable", color: "text-rose-600", bg: "bg-rose-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-border shadow-none rounded-xl bg-white group hover:border-primary/20 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] uppercase font-bold">{stat.trend}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <h4 className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</h4>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Analytics Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <Card className="lg:col-span-8 border-border shadow-none rounded-xl bg-white overflow-hidden">
             <CardHeader className="p-8 border-b border-slate-50">
               <div className="flex justify-between items-center">
                 <div>
                   <CardTitle className="text-lg font-bold text-slate-900">Velocity Tracking</CardTitle>
                   <CardDescription className="text-xs">Weekly user acquisition and platform growth</CardDescription>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase">Export CSV</Button>
                    <Badge variant="outline" className="h-8 px-3 rounded-md text-[10px] font-bold">L30 DAYS</Badge>
                 </div>
               </div>
             </CardHeader>
             <CardContent className="p-8">
               <div className="h-80 w-full">
                 <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                   <AreaChart data={stats?.analytics?.usersGrowth || []}>
                     <defs>
                       <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.05}/>
                         <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} />
                     <Tooltip 
                       contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                     />
                     <Area type="monotone" dataKey="count" stroke="#1D4ED8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" />
                   </AreaChart>
                 </ResponsiveContainer>
               </div>
             </CardContent>
           </Card>

           <Card className="lg:col-span-4 border-border shadow-none rounded-xl bg-white">
             <CardHeader className="p-8 border-b border-slate-50">
                <CardTitle className="text-lg font-bold text-slate-900">Compliance Health</CardTitle>
                <CardDescription className="text-xs">Security SLA & Verification Status</CardDescription>
             </CardHeader>
             <CardContent className="p-8 space-y-8">
                <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
                   <div className="absolute inset-0 rounded-full border-8 border-slate-100" />
                   <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent -rotate-45" />
                   <div className="text-center space-y-1">
                      <p className="text-3xl font-black text-slate-900">98.2%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SLA Health</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                         <Activity size={16} className="text-emerald-500" />
                         <span className="text-xs font-semibold text-slate-700">Audit Logs Active</span>
                      </div>
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                         <ShieldCheck size={16} className="text-primary" />
                         <span className="text-xs font-semibold text-slate-700">SSL Identity Secure</span>
                      </div>
                      <CheckCircle2 size={16} className="text-emerald-500" />
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>

        {/* Activity Feed & Control Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Ingress Monitor</h3>
                 <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">View Full Logs</Button>
              </div>
              <Card className="border-border shadow-none rounded-xl bg-white overflow-hidden">
                <div className="divide-y divide-slate-50">
                   {(stats?.recentUsers || []).slice(0, 6).map((user: any, i: number) => (
                      <div key={user._id || i} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center font-bold text-slate-600 text-sm">
                               {user.name.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900">{user.name}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <Badge className="h-5 px-1.5 bg-slate-100 text-slate-500 border-none text-[9px] font-bold uppercase">{user.role}</Badge>
                                  <span className="text-[10px] text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors">
                            <ChevronRight size={18} />
                         </Button>
                      </div>
                   ))}
                </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Quick Actions</h3>
              <Card className="border-border shadow-none rounded-xl bg-white p-6 space-y-3">
                 {[
                   { label: "Run Startup Scraper", icon: Rocket, color: "text-indigo-600", bg: "bg-indigo-50" },
                   { label: "Broadcast Outreach", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
                   { label: "Audit Security Queue", icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                   { label: "System Maintenance", icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
                 ].map((action, i) => (
                   <Button key={i} variant="outline" className="w-full justify-start h-12 px-4 border-slate-100 hover:border-primary/20 hover:bg-slate-50 transition-all group">
                      <div className={cn("p-1.5 rounded-md mr-3", action.bg, action.color)}>
                         <action.icon size={14} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{action.label}</span>
                   </Button>
                 ))}
              </Card>

              <Card className="border-none shadow-sm rounded-xl bg-slate-900 text-white p-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                       <ShieldCheck size={14} className="text-emerald-500" />
                       <span>Governance SLA</span>
                    </div>
                    <h4 className="text-2xl font-bold leading-tight">System Integrity<br />Verified</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">All core services are operating at peak efficiency. Identity verification throughput: 12.4ms/v</p>
                    <Button className="w-full bg-white text-slate-900 font-bold h-11 text-xs uppercase hover:bg-white/90">
                       Health Dashboard
                    </Button>
                 </div>
              </Card>
           </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
