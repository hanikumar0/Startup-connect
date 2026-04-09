"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/lib/store";
import { 
  Rocket, 
  Target, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Search,
  Sparkles,
  Loader2,
  CheckCircle2,
  Lock,
  Building2,
  BrainCircuit,
  Cpu,
  PieChart,
  Users,
  IndianRupee
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetchJSON } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dynamic Import for Heatmap to avoid SSR issues
const DynamicHeatmap = dynamic(() =>
  import("@/components/analytics/InvestmentHeatmap").then(mod => mod.InvestmentHeatmap),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-lg border border-border" /> }
);

export default function InvestorDashboard() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Verification States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState(1);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyData, setVerifyData] = useState({
    aadhaarLast4: "",
    panNumber: "",
    gstNumber: "",
    udyamNumber: "",
    dpiitNumber: "",
    otp: ""
  });

  useEffect(() => {
    async function initDashboard() {
      if (user) {
        setIsLoading(true);
        await Promise.all([
          fetchStats(),
          fetchMatches(),
          fetchMeetings()
        ]);
        setIsLoading(false);
      }
    }
    initDashboard();
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await apiFetchJSON("/api/users/stats");
      if (data.success) setStats(data.stats);
    } catch (err) { console.error("Stats fail", err); }
  };

  const fetchMatches = async () => {
    try {
      const data = await apiFetchJSON("/api/match/me");
      if (data.success) setMatches(data.data || []);
    } catch (err) { console.error("Matches fail", err); }
  };

  const fetchMeetings = async () => {
    try {
      const data = await apiFetchJSON("/api/meetings");
      if (data.success) setMeetings(data.data || []);
    } catch (err) { console.error("Meetings fail", err); }
  };

  const handleVerifySubmit = async () => {
    setVerifyLoading(true);
    try {
      const data = await apiFetchJSON("/api/users/verify", {
        method: "POST",
        body: JSON.stringify(verifyData),
      });
      if (data.success) {
        setVerifyStep(4);
        setTimeout(() => {
           updateUser({ verificationStatus: 'VERIFIED' });
        }, 3000);
      }
      else alert(data.message || "Failed");
    } catch (err) { alert("Verification error"); }
    finally { setVerifyLoading(false); }
  };

  const getIcon = (name: any) => {
    if (typeof name !== 'string') return name || BarChart3;
    switch (name) {
      case 'IndianRupee': return IndianRupee;
      case 'Target': return Target;
      case 'Users': return Users;
      case 'Calendar': return Calendar;
      case 'PieChart': return PieChart;
      case 'Zap': return Zap;
      default: return BarChart3;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-[1240px] mx-auto px-6 py-10 space-y-10">
        
        {/* Professional Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <span>Investor Console</span>
               <ChevronRight size={12} />
               <span>Overview</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
               Welcome back, {user?.name?.split(' ')[0] || "Investor"}
            </h1>
          </div>
          <div className="flex items-center gap-6 shrink-0">
             <div className="flex items-center gap-8">
                <div className="text-right">
                  <span className="block text-2xl font-bold text-slate-900">{stats.find(s => s.label.includes('IRR'))?.value || '--'}</span>
                  <span className="block text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Portfolio IRR</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-right">
                  <span className="block text-2xl font-bold text-slate-900">{stats.find(s => s.label.includes('DPI'))?.value || '--'}</span>
                  <span className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">DPI Ratio</span>
                </div>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Discovery Area */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* AI Deals Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Deal Recommendations</h3>
                 <Link href="/startup/matches" className="text-xs font-semibold text-primary hover:underline">View discovery</Link>
              </div>
              
              {matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {matches.slice(0, 2).map((match, i) => (
                      <Card key={i} className="rounded-lg border-border shadow-none bg-white hover:border-primary/20 transition-all hover:shadow-md cursor-pointer group">
                        <CardContent className="p-6">
                           <div className="flex items-center justify-between mb-4">
                              <Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase font-bold tracking-wider">{match.score}% Thesis Alignment</Badge>
                              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                           </div>
                           <h4 className="font-bold text-slate-900 truncate">{match.startup?.name || "Target Venture"}</h4>
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1 italic-none">{match.startup?.industry || "Tech"}</p>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              ) : (
                <Card className="rounded-lg border-border border-dashed shadow-none bg-slate-50/30 overflow-hidden">
                   <div className="p-16 text-center space-y-3">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                         <Zap size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Curating high-alpha opportunities</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">AI is filtering live deals based on your sector preferences and IRR targets.</p>
                   </div>
                </Card>
              )}
            </section>

            {/* Investment Heatmap - RESTORED FEATURE */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Portfolio Concentration</h3>
               <DynamicHeatmap />
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Thesis Thesis Card */}
            <Card className="rounded-lg border-border shadow-none bg-white">
               <CardContent className="p-8 space-y-8">
                  <div className="space-y-2">
                     <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Investment Thesis</p>
                     <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-slate-900">0%</span>
                        <span className="text-xs font-semibold text-slate-400 mb-1">Thesis Completion</span>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="h-2 w-full bg-slate-100 rounded-full">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: '0%' }} />
                     </div>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Setup your target stage and sector to start receiving curated deal-flow recommendations.
                     </p>
                  </div>
                  <Button variant="outline" className="w-full h-10 border-slate-200 text-slate-900 font-bold text-xs rounded-md hover:bg-slate-50">
                     Setup Thesis
                  </Button>
               </CardContent>
            </Card>

            {/* Verification / Institutional Vetting */}
            <Card className={cn(
               "rounded-lg border-none shadow-lg text-white overflow-hidden relative group",
               user?.verificationStatus === 'VERIFIED' ? "bg-emerald-600" : "bg-slate-900"
            )}>
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={100} />
               </div>
               <CardContent className="p-8 space-y-6 relative z-10">
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold">Vetted Status</h3>
                     <p className="text-xs text-slate-400 leading-relaxed">
                        {user?.verificationStatus === 'VERIFIED' 
                          ? "Your fund is fully verified for institutional deal-flow." 
                          : "Complete identity vetting to access private term sheets."}
                     </p>
                  </div>
                  {user?.verificationStatus !== 'VERIFIED' && (
                    <Button onClick={() => setShowVerifyModal(true)} className="w-full h-10 bg-white text-slate-900 font-bold text-xs rounded-md hover:bg-slate-50">
                       Start Vetting
                    </Button>
                  )}
               </CardContent>
            </Card>

            {/* Meetings */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider px-1">Diligence Calls</h3>
               {meetings.length > 0 ? (
                 <div className="space-y-3">
                    {meetings.map((m, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white border border-border group hover:border-primary/20 transition-all cursor-pointer">
                         <div className="flex items-center gap-3 mb-2">
                            <Calendar size={14} className="text-primary" />
                            <span className="text-xs font-bold text-slate-900">{m.title}</span>
                         </div>
                         <p className="text-[10px] text-slate-500">{new Date(m.startTime).toLocaleString()}</p>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-8 rounded-lg border border-border border-dashed bg-white text-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    No active diligence calls
                 </div>
               )}
            </section>
          </aside>
        </div>
      </div>

      {/* Verification Modal (Full Feature) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden dark:bg-slate-900">
            <CardHeader className="bg-slate-900 text-white p-8">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-5 w-5" />
                  <CardTitle className="text-xl">Institutional Vetting</CardTitle>
                </div>
                <CardDescription className="text-white/80">
                  Verify your identity to unlock private equity deal-flow.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
               {verifyStep === 1 ? (
                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-slate-500">Aadhaar (Last 4)</Label>
                          <Input maxLength={4} className="h-11" placeholder="XXXX" value={verifyData.aadhaarLast4} onChange={e => setVerifyData({...verifyData, aadhaarLast4: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase text-slate-500">PAN Card</Label>
                          <Input className="h-11 uppercase" placeholder="ABCDE1234F" value={verifyData.panNumber} onChange={e => setVerifyData({...verifyData, panNumber: e.target.value})} />
                       </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-border flex gap-3">
                       <Lock size={16} className="text-primary mt-0.5" />
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Compliance-first verification. Data is encrypted and managed via secure institutional gateways.</p>
                    </div>
                    <div className="flex gap-3">
                       <Button variant="ghost" onClick={() => setShowVerifyModal(false)} className="flex-1 font-bold text-xs uppercase">Cancel</Button>
                       <Button onClick={handleVerifySubmit} className="flex-1 bg-primary text-white font-bold text-xs uppercase shadow-lg shadow-primary/20">
                          {verifyLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify Identity"}
                       </Button>
                    </div>
                 </div>
               ) : (
                 <div className="py-8 text-center space-y-6">
                    <CheckCircle2 size={60} className="text-emerald-500 mx-auto" />
                    <div className="space-y-2">
                       <h4 className="text-xl font-bold">Vetting Complete!</h4>
                       <p className="text-sm text-slate-500">Your fund now has full access to the Startup Connect deal-flow matches.</p>
                    </div>
                    <Button onClick={() => setShowVerifyModal(false)} className="w-full bg-primary text-white font-bold">Return to Dashboard</Button>
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
