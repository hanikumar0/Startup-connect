"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Calendar,
  ShieldCheck,
  ArrowUpRight,
  Zap,
  MessageSquare,
  Building2,
  IndianRupee,
  PieChart,
  Rocket,
  Target,
  Video,
  Loader2,
  CheckCircle2,
  Lock,
  FileText,
  User as UserIcon,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  BrainCircuit,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const DynamicHeatmap = dynamic(() =>
  import("@/components/analytics/InvestmentHeatmap").then(mod => mod.InvestmentHeatmap),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-2xl" /> }
);

const IconMap: any = {
  IndianRupee,
  Target,
  Users,
  Calendar,
  PieChart,
  Zap
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState(true);
  const [isMeetingsLoading, setIsMeetingsLoading] = useState(true);
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
    if (user) {
      if (user.isProfileCompleted) {
        fetchStats();
        fetchMatches(user.role);
        fetchMeetings();
      } else {
        setIsLoading(false);
      }
    }
  }, [user]);

  const fetchMatches = async (role: string) => {
    try {
      const userRole = (role || "").toLowerCase();
      const response = await apiFetch(`/api/ai/${userRole}`);
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setIsMatchesLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await apiFetch(`/api/meetings/my-meetings`);
      const data = await response.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
    } finally {
      setIsMeetingsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiFetch(`/api/users/stats`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async () => {
    setVerifyLoading(true);
    try {
      const response = await apiFetch("/api/users/verify", {
        method: "POST",
        body: JSON.stringify(verifyData),
      });
      const data = await response.json();
      if (data.success) {
        setVerifyStep(3);
      } else {
        toast.error(data.message || "Submission failed");
        setVerifyStep(1);
      }
    } catch (error) {
      toast.error("An error occurred during verification submission");
      setVerifyStep(1);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    setVerifyLoading(true);
    try {
      const response = await apiFetch("/api/users/verify-otp", {
        method: "POST",
        body: JSON.stringify({ otp: verifyData.otp }),
      });
      const data = await response.json();
      if (data.success) {
        setVerifyStep(4);
        updateUser({ verificationStatus: 'VERIFIED' });
        toast.success("Identity verified successfully");
      } else {
        toast.error(data.message || "OTP verification failed");
      }
    } catch (error) {
      toast.error("An error occurred during OTP verification");
    } finally {
      setVerifyLoading(false);
    }
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  }, []);

  if (!user || isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
      </div>
    );
  }

  const isStartup = user.role?.toUpperCase() === "STARTUP";

  return (
    <div className="space-y-10 animate-in fade-in duration-500">

      {/* Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{greeting}</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{user.name.split(' ')[0]} <span className="text-slate-400 not-italic font-medium">/ Dashboard</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 border-slate-200 text-[10px] font-black uppercase tracking-widest px-6 italic" asChild>
            <Link href="/settings">Edit Profile</Link>
          </Button>
          <Button className="h-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 italic shadow-lg shadow-slate-200" asChild>
            <Link href="/discover">
              Discover {isStartup ? "Investors" : "Startups"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.length > 0 ? stats.map((stat, i) => {
          const Icon = IconMap[stat.icon] || TrendingUp;
          return (
            <Card key={i} className="border border-slate-100 shadow-sm overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-900 border border-slate-100">
                    <Icon size={20} />
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-black uppercase tracking-widest px-2">{stat.trend}</Badge>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        }) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-xl border border-slate-100" />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Intelligence Section */}
        <div className="lg:col-span-2 space-y-8">

          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Strategic Matching</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">AI-Powered Recommendations</p>
                </div>
                <Button variant="ghost" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 p-0 h-auto" asChild>
                  <Link href="/discover">Review All <ChevronRight size={14} className="ml-1" /></Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isMatchesLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matches.slice(0, 2).map((match, i) => {
                    const item = match.startup || match.investor;
                    return (
                      <Link key={i} href="/discover" className="group p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-10 w-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors">
                            {isStartup ? <Building2 size={20} /> : <Rocket size={20} />}
                          </div>
                          <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase tracking-[0.1em] px-2 italic">{match.score}% MATCH</Badge>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase italic truncate">{item.name || item.firm || item.startupName || item.investorName}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">{item.industry || item.type || item.sector}</p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-100">
                  <Target className="mx-auto h-10 w-10 text-slate-200 mb-4" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Analysis in Progress</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 max-w-xs mx-auto">Complete your profile expansion to let the matching core synchronize.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {!isStartup && <DynamicHeatmap />}

          <Card className="border-slate-100 shadow-sm bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-8 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10"><BrainCircuit size={100} /></div>
              <Badge className="bg-white/10 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 mb-4">Neural Analytics</Badge>
              <h3 className="text-xl font-black uppercase italic mb-4 tracking-tight leading-none">Global Deal Flow Insights</h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-md">
                {isStartup
                  ? "Our agents are currently scanning active VCs in your geography. Adjust your pitch deck to match the current 2024 liquidity trends."
                  : "Macro trends suggest a pivot towards sustainable infrastructure in your preferred sectors. AI has identified 14 outlier targets for review."}
              </p>
              <Button variant="outline" className="mt-8 h-10 border-white/20 hover:bg-white hover:text-slate-900 text-[10px] font-black uppercase tracking-widest px-8 italic">Access Full Intel</Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8">

          {/* Verification Status */}
          <Card className={`border-none shadow-sm overflow-hidden text-white ${user.verificationStatus === 'VERIFIED' ? 'bg-emerald-600 shadow-emerald-100' : 'bg-slate-900 shadow-slate-100'}`}>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={28} />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest leading-none">Vetted Status</h3>
                  <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest mt-1">{user.verificationStatus}</p>
                </div>
              </div>
              <p className="text-[11px] font-semibold opacity-80 leading-relaxed mb-8">
                {user.verificationStatus === "VERIFIED"
                  ? "Access granted to exclusive high-capital networks and private data rooms."
                  : "Institutional-grade verification is required to participate in equity rounds."}
              </p>
              {user.verificationStatus !== "VERIFIED" && (
                <Button
                  className="w-full bg-white text-slate-900 hover:bg-slate-50 border-none text-[10px] font-black uppercase tracking-widest italic h-12"
                  onClick={() => setShowVerifyModal(true)}
                  disabled={user.verificationStatus === "PENDING"}
                >
                  {user.verificationStatus === "PENDING" ? "Reviewing Assets" : "Initiate E-KYC"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Schedule Sidebar */}
          <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 px-6 py-4 flex flex-row items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Schedule</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900" asChild>
                <Link href="/meetings"><ArrowUpRight size={16} /></Link>
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {isMeetingsLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-100" /></div>
              ) : meetings.length > 0 ? (
                <div className="space-y-4">
                  {meetings.slice(0, 3).map((meeting, i) => (
                    <Link key={i} href="/meetings" className="flex items-center gap-4 group">
                      <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-900">
                        <span className="text-[8px] font-black uppercase tracking-tighter leading-none opacity-40">MTH</span>
                        <span className="text-sm font-black leading-none mt-0.5 italic">{new Date(meeting.startTime).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase italic truncate group-hover:text-slate-500 transition-colors">{meeting.title}</h4>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-8 w-8 text-slate-100 mb-3" />
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No active sessions</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 bg-white">
            <CardHeader className="bg-slate-900 text-white p-10">
              <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 mb-4 italic">Secure Infrastructure</Badge>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Institutional Vetting</h2>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">Secure your profile with real-time government database synchronization. We do not store sensitive identifiers on local nodes.</p>
            </CardHeader>
            <CardContent className="p-10">
              {verifyStep === 1 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aadhaar (Last 4)</Label>
                      <Input
                        placeholder="0000"
                        maxLength={4}
                        className="h-12 text-center text-lg font-black border-slate-100 bg-slate-50 focus:bg-white transition-all"
                        value={verifyData.aadhaarLast4}
                        onChange={(e) => setVerifyData({ ...verifyData, aadhaarLast4: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PAN Identifier</Label>
                      <Input
                        placeholder="ABCDE1234F"
                        className="h-12 uppercase text-center text-lg font-black border-slate-100 bg-slate-50 focus:bg-white transition-all"
                        value={verifyData.panNumber}
                        onChange={(e) => setVerifyData({ ...verifyData, panNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {isStartup && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GSTIN Registration</Label>
                        <Input
                          placeholder="GSTIN ID"
                          className="h-12 uppercase font-black border-slate-100 bg-slate-50"
                          value={verifyData.gstNumber}
                          onChange={(e) => setVerifyData({ ...verifyData, gstNumber: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Udyam Cert</Label>
                          <Input
                            placeholder="MSME ID"
                            className="h-12 uppercase font-black border-slate-100 bg-slate-50"
                            value={verifyData.udyamNumber}
                            onChange={(e) => setVerifyData({ ...verifyData, udyamNumber: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">DPIIT Recognition</Label>
                          <Input
                            placeholder="STARTUP ID"
                            className="h-12 uppercase font-black border-slate-100 bg-slate-50"
                            value={verifyData.dpiitNumber}
                            onChange={(e) => setVerifyData({ ...verifyData, dpiitNumber: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button variant="ghost" onClick={() => setShowVerifyModal(false)} className="flex-1 h-12 text-[10px] font-black uppercase tracking-widest">Cancel</Button>
                    <Button
                      onClick={handleVerifySubmit}
                      className="flex-1 bg-slate-900 text-white h-12 text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-slate-200"
                      disabled={!verifyData.aadhaarLast4 || !verifyData.panNumber || verifyLoading}
                    >
                      {verifyLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : "Verify Identity"}
                    </Button>
                  </div>
                </div>
              ) : verifyStep === 3 ? (
                <div className="space-y-8 text-center">
                  <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                    <Lock size={28} className="text-slate-900" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase italic tracking-tighter">Enter Authentication OTP</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">6-digit code sent to your UIDAI registered mobile</p>
                  </div>
                  <Input
                    placeholder="· · · · · ·"
                    maxLength={6}
                    className="h-16 text-center text-3xl font-black tracking-[0.5em] border-slate-100 bg-slate-50"
                    value={verifyData.otp}
                    onChange={(e) => setVerifyData({ ...verifyData, otp: e.target.value })}
                  />
                  <Button
                    onClick={handleOTPSubmit}
                    className="w-full bg-slate-900 text-white h-14 text-[10px] font-black uppercase tracking-widest italic"
                    disabled={verifyData.otp.length < 6 || verifyLoading}
                  >
                    {verifyLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : "Authenticate Assets"}
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-xl shadow-emerald-100">
                    <CheckCircle2 size={36} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Infrastructure Verified</h4>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-4 max-w-xs mx-auto">Your institutional credentials have been synchronized. You are now a **Vetted Member** of Startup Connect.</p>
                  </div>
                  <Button onClick={() => setShowVerifyModal(false)} className="w-full bg-slate-900 text-white h-14 text-[10px] font-black uppercase tracking-widest italic">Return to Intel</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
