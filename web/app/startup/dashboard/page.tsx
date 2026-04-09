"use client";

import { useEffect, useState, useMemo } from "react";
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
  IndianRupee,
  Users,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetchJSON } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StartupDashboard() {
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
               <span>Dashboard</span>
               <ChevronRight size={12} />
               <span>Overview</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
              Welcome back, {user?.name?.split(' ')[0] || "Founder"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className={cn(
               "h-9 px-4 font-semibold text-xs border transition-colors",
               user?.verificationStatus === 'VERIFIED' 
               ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
               : "bg-amber-50 border-amber-200 text-amber-700"
             )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full mr-2",
                  user?.verificationStatus === 'VERIFIED' ? "bg-emerald-500" : "bg-amber-500"
                )} />
                {user?.verificationStatus === 'VERIFIED' ? "Vetted Member" : "Action Required"}
             </Badge>
             <Button className="h-9 px-4 bg-primary text-white rounded-md text-xs font-semibold shadow-sm hover:bg-primary/90">
                Share Profile
             </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8 space-y-8">
            
            {/* Real Metrics Grid */}
             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(stats.length > 0 ? stats : [
                  { label: 'Profile Views', value: '0', icon: 'BarChart3', trend: '0%' },
                  { label: 'Active Matches', value: '0', icon: 'Target', trend: '0%' },
                  { label: 'Messages', value: '0', icon: 'MessageSquare', trend: '0%' },
                  { label: 'Meetings', value: '0', icon: 'Calendar', trend: '0%' },
                ]).map((stat: any, i: number) => {
                  const Icon = getIcon(stat.icon);
                  return (
                    <Card key={i} className="rounded-lg border-border shadow-none bg-white">
                       <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                             <div className={cn("p-2 rounded-md border border-slate-100", stat.bg || "bg-slate-50")}>
                                <Icon size={16} className={stat.color || "text-slate-600"} />
                             </div>
                             <span className="text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded">{stat.trend || '--'}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                          <h4 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h4>
                       </CardContent>
                    </Card>
                  );
                })}
             </div>

            {/* AI Matches Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Smart Matches</h3>
                 <Link href="/startup/matches" className="text-xs font-semibold text-primary hover:underline">View all</Link>
              </div>
              
              {matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {matches.slice(0, 2).map((match, i) => (
                      <Card key={i} className="rounded-lg border-border shadow-none bg-white hover:border-primary/20 transition-all hover:shadow-md cursor-pointer group">
                        <CardContent className="p-6">
                           <div className="flex items-center justify-between mb-4">
                              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px] uppercase font-bold">{match.score}% Match</Badge>
                              <ArrowUpRight size={14} className="text-slate-300 group-hover:text-primary transition-colors" />
                           </div>
                           <h4 className="font-bold text-slate-900 truncate">{match.investor?.firm || "Lead Investor"}</h4>
                           <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">{match.investor?.type || "VC"}</p>
                        </CardContent>
                      </Card>
                   ))}
                </div>
              ) : (
                <Card className="rounded-lg border-border border-dashed shadow-none bg-slate-50/30 overflow-hidden">
                   <div className="p-12 text-center space-y-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                         <Target size={20} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Identifying high-signal leads</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">AI is scanning the market for investors aligned with your thesis.</p>
                   </div>
                </Card>
              )}
            </section>

            {/* Profile Activity List */}
            <section className="space-y-4">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Activity</h3>
               <Card className="rounded-lg border-border shadow-none bg-white">
                  <div className="p-8 text-center text-xs font-semibold text-slate-400 uppercase tracking-widest">
                     System logs will appear here
                  </div>
               </Card>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            
            {/* Vetted Status / Verification Card */}
            <Card className={cn(
              "rounded-lg border-none shadow-lg text-white overflow-hidden relative group",
              user?.verificationStatus === 'VERIFIED' ? "bg-emerald-600" : "bg-primary"
            )}>
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <ShieldCheck size={100} />
               </div>
               <CardContent className="p-8 space-y-6 relative z-10">
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold">Verification</h3>
                     <p className="text-xs text-secondary-foreground/80 leading-relaxed font-medium">
                        {user?.verificationStatus === 'VERIFIED' 
                          ? "Your profile is institutional-grade verified." 
                          : "Complete E-KYC to unlock premium investor matching."}
                     </p>
                  </div>
                  {user?.verificationStatus !== 'VERIFIED' && (
                    <Button onClick={() => setShowVerifyModal(true)} className="w-full h-10 bg-white text-primary font-bold text-xs rounded-md hover:bg-slate-50">
                       Start E-KYC
                    </Button>
                  )}
               </CardContent>
            </Card>

            {/* Meetings Section */}
            <section className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Meetings</h3>
                  <Badge variant="secondary" className="text-[10px]">{meetings.length}</Badge>
               </div>
               {meetings.length > 0 ? (
                 <div className="space-y-3">
                    {meetings.map((m, i) => (
                      <div key={i} className="p-4 rounded-lg bg-white border border-border flex items-center gap-3">
                         <Calendar size={14} className="text-primary" />
                         <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{m.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(m.startTime).toLocaleDateString()}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-6 rounded-lg bg-white border border-border border-dashed text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No meetings scheduled</p>
                 </div>
               )}
            </section>

            {/* AI Insights Card */}
            <Card className="rounded-lg border-border bg-slate-900 text-white overflow-hidden">
               <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                     <BrainCircuit size={16} className="text-primary" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Outreach Intel</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                     Your pitch deck is receiving high conversion from Fintech focused VCs. Use these insights to optimize your outreach.
                  </p>
               </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Verification Modal (Full Feature) */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-500">
          <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden dark:bg-slate-900">
            <CardHeader className="bg-primary text-white p-8">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck className="h-5 w-5" />
                  <CardTitle className="text-xl">Vetted Verification</CardTitle>
                </div>
                <CardDescription className="text-white/80">
                  Secure your profile with real-time government database integration.
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
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">GSTIN / Business ID</Label>
                        <Input className="h-11 uppercase" placeholder="22AAAAA0000A1Z5" value={verifyData.gstNumber} onChange={e => setVerifyData({...verifyData, gstNumber: e.target.value})} />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-border flex gap-3">
                       <Lock size={16} className="text-primary mt-0.5" />
                       <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Data is encrypted and used only for one-time verification. We do not store full identifiers.</p>
                    </div>
                    <div className="flex gap-3">
                       <Button variant="ghost" onClick={() => setShowVerifyModal(false)} className="flex-1 font-bold text-xs uppercase">Cancel</Button>
                       <Button onClick={handleVerifySubmit} className="flex-1 bg-primary text-white font-bold text-xs uppercase shadow-lg shadow-primary/20">
                          {verifyLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify Info"}
                       </Button>
                    </div>
                 </div>
               ) : (
                 <div className="py-8 text-center space-y-6">
                    <CheckCircle2 size={60} className="text-emerald-500 mx-auto" />
                    <div className="space-y-2">
                       <h4 className="text-xl font-bold">Verification Complete!</h4>
                       <p className="text-sm text-slate-500">Your profile now features the Vetted Member badge.</p>
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
