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
  DollarSign,
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
  Moon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvestmentHeatmap } from "@/components/analytics/InvestmentHeatmap";
import { Sparkles, BrainCircuit } from "lucide-react";
import { apiFetch } from "@/lib/api";

const DynamicHeatmap = dynamic(() =>
  import("@/components/analytics/InvestmentHeatmap").then(mod => mod.InvestmentHeatmap),
  { ssr: false, loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-2xl" /> }
);

const IconMap: any = {
  DollarSign,
  Target,
  Users,
  Calendar,
  PieChart,
  Zap
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatchesLoading, setIsMatchesLoading] = useState(true);
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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Only fetch data if the profile is completed
      if (parsedUser.isProfileCompleted) {
        fetchStats();
        fetchMatches(parsedUser.role);
      }
    }
  }, []);

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

  const fetchStats = async () => {
    try {
      const response = await apiFetch(`/api/users/stats`);

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
          }
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
        // Now simulate sending OTP
        setVerifyStep(3); // Go to OTP entry step
      } else {
        alert(data.message || "Submission failed");
        setVerifyStep(1);
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("An error occurred during verification submission");
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
        setVerifyStep(4); // Success step
        const updatedUser = { ...user, verificationStatus: 'VERIFIED' };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        alert(data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP Error:", error);
      alert("An error occurred during OTP verification");
    } finally {
      setVerifyLoading(false);
    }
  };

  // 1. Hooks (Memoized values)
  const statsGrid = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, i) => {
        const Icon = IconMap[stat.icon] || TrendingUp;
        return (
          <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all duration-300 dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className={`${stat.color} font-bold text-xs`}>
                  {stat.trend}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  ), [stats]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good morning", icon: <Sunrise className="h-8 w-8 text-amber-500" /> };
    if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: <Sun className="h-8 w-8 text-orange-400" /> };
    if (hour >= 17 && hour < 21) return { text: "Good evening", icon: <Sunset className="h-8 w-8 text-indigo-400" /> };
    return { text: "Good night", icon: <Moon className="h-8 w-8 text-slate-400" /> };
  }, []);

  // 2. Guards (After all hooks)
  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const userRole = (user?.role || "").trim().toUpperCase();
  const isStartup = userRole === "STARTUP";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            {greeting.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{greeting.text}, {user.name.split(' ')[0]}!</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Here's what's happening with your {isStartup ? 'startup' : 'investments'} today.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`py-2 px-4 bg-white dark:bg-slate-900 font-medium ${user.verificationStatus === 'VERIFIED' ? 'text-emerald-600 border-emerald-100 dark:border-emerald-900/30' : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'}`}>
            <span className={`flex h-2 w-2 rounded-full mr-2 ${user.verificationStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {user.verificationStatus === "VERIFIED" ? "Vetted Member" : (user.verificationStatus === "PENDING" ? "Verification Pending" : "Unverified")}
          </Badge>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            <Link href="/dashboard/discover">
              {isStartup ? "Discover Investors" : "Discover Startups"}
            </Link>
          </Button>
        </div>
      </div>

      {statsGrid}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden dark:bg-slate-900">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Smart Matches</CardTitle>
                  <CardDescription>AI-powered recommendations based on your profile.</CardDescription>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-indigo-600 font-semibold hover:text-indigo-700 hover:bg-indigo-50"
                >
                  <Link href="/dashboard/discover">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {isMatchesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.slice(0, 2).map((match, i) => {
                    const item = match.startup || match.investor;
                    return (
                      <Link key={i} href="/dashboard/discover" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                            {isStartup ? <Building2 className="h-5 w-5 text-indigo-600" /> : <Rocket className="h-5 w-5 text-indigo-600" />}
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">{match.score}% Match</Badge>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.name || item.firm}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-bold">{item.industry || item.type}</p>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <Target className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <div className="max-w-70">
                      <h4 className="font-semibold text-slate-900 dark:text-white">No matches yet</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Complete your profile and start interacting to see AI matches here.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Investment Heatmap */}
          {!isStartup && <DynamicHeatmap />}
        </div>

        {/* Sidebar Activity/Status */}
        <div className="space-y-6">
          <Card className={`border-none shadow-sm overflow-hidden relative group ${user.verificationStatus === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
              <ShieldCheck size={120} />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xl font-bold mb-2">Verification Status</h3>
              <p className="text-indigo-100 text-sm mb-6">
                {user.verificationStatus === "VERIFIED"
                  ? "Your account is fully verified and vetted."
                  : "Complete your identity check to unlock full platform features."}
              </p>
              <div className="space-y-3 mb-6">
                {[
                  { label: "Phone & Email", done: true },
                  { label: "Government ID", done: user.verificationStatus === "VERIFIED" },
                  { label: "Business Registration", done: user.verificationStatus === "VERIFIED" && isStartup },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {step.done ? (
                      <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                        <CheckCircle2 className={`h-3 w-3 ${user.verificationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-indigo-600'}`} />
                      </div>
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-indigo-400" />
                    )}
                    <span className={step.done ? "text-white" : "text-indigo-300"}>{step.label}</span>
                  </div>
                ))}
              </div>
              {user.verificationStatus !== "VERIFIED" && (
                <Button
                  className="w-full bg-white text-indigo-600 hover:bg-indigo-50 border-none shadow-lg"
                  onClick={() => setShowVerifyModal(true)}
                  disabled={user.verificationStatus === "PENDING"}
                >
                  {user.verificationStatus === "PENDING" ? "Under Review" : "Start E-KYC"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400">Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-center py-6">
              <div className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 flex flex-col items-center gap-4 group cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all">
                <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">One-Click Scheduler</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">AI suggests slots based on your synced calendar.</p>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/40 p-2 h-auto" onClick={() => router.push("/dashboard/meetings")}>
                  Connect Calendar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-linear-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Deal Flow</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {isStartup
                  ? "AI is analyzing active term sheets in your sector to provide market benchmarks."
                  : "Scanning live deals in your preferred sectors for high-alpha opportunities."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-700">
          <Card className="w-full max-w-lg border-none shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 dark:bg-slate-900">
            <CardHeader className="bg-indigo-600 text-white p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">Vetted Verification</CardTitle>
              </div>
              <CardDescription className="text-indigo-100">
                Secure your profile with our real-time government database integration.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {verifyStep === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Aadhaar (Last 4)</Label>
                        <Input
                          placeholder="XXXX"
                          maxLength={4}
                          className="h-11 text-center"
                          value={verifyData.aadhaarLast4}
                          onChange={(e) => setVerifyData({ ...verifyData, aadhaarLast4: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PAN Card</Label>
                        <Input
                          placeholder="ABCDE1234F"
                          className="h-11 uppercase"
                          value={verifyData.panNumber}
                          onChange={(e) => setVerifyData({ ...verifyData, panNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    {isStartup && (
                      <>
                        <div className="space-y-2">
                          <Label>GSTIN</Label>
                          <Input
                            placeholder="22AAAAA0000A1Z5"
                            className="h-11 uppercase"
                            value={verifyData.gstNumber}
                            onChange={(e) => setVerifyData({ ...verifyData, gstNumber: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Udyam (MSME)</Label>
                            <Input
                              placeholder="UDYAM-XX-00-0000000"
                              className="h-11 uppercase"
                              value={verifyData.udyamNumber}
                              onChange={(e) => setVerifyData({ ...verifyData, udyamNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>DPIIT Number</Label>
                            <Input
                              placeholder="DPIIT12345"
                              className="h-11 uppercase"
                              value={verifyData.dpiitNumber}
                              onChange={(e) => setVerifyData({ ...verifyData, dpiitNumber: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                    <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      Your data is encrypted and only used for one-time verification. We do not store full identifiers.
                    </p>
                  </div>
                </div>
              ) : verifyStep === 3 ? (
                <div className="space-y-6 text-center py-4">
                  <div className="h-16 w-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-8 w-8 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-lg">Enter Aadhaar OTP</h4>
                    <p className="text-slate-500 text-sm">6-digit code sent to your mobile linked with Aadhaar XXXX</p>
                  </div>
                  <div className="max-w-50 mx-auto">
                    <Input
                      placeholder="· · · ·"
                      maxLength={4}
                      className="h-14 text-center text-2xl tracking-[1em] font-bold border-indigo-100 dark:border-indigo-800 focus:border-indigo-600 focus:ring-indigo-100 dark:bg-slate-800"
                      value={verifyData.otp}
                      onChange={(e) => setVerifyData({ ...verifyData, otp: e.target.value })}
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Didn't receive it? <span className="text-indigo-600 font-bold cursor-pointer">Resend OTP</span></p>
                  <Button
                    onClick={handleOTPSubmit}
                    className="w-full bg-indigo-600 h-11"
                    disabled={verifyData.otp.length < 4 || verifyLoading}
                  >
                    {verifyLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Verify & Authenticate
                  </Button>
                </div>
              ) : (
                <div className="py-8 text-center space-y-6">
                  <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xl">Account Verified!</h4>
                    <p className="text-slate-500 dark:text-slate-400">Your profile is now live with the **Vetted Member** badge. You can now connect with top-tier partners.</p>
                  </div>
                  <Button onClick={() => setShowVerifyModal(false)} className="w-full bg-indigo-600">Back to Dashboard</Button>
                </div>
              )}
            </CardContent>
            {verifyStep === 1 && (
              <div className="p-4 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex gap-3">
                <Button variant="ghost" onClick={() => setShowVerifyModal(false)} className="flex-1 dark:text-slate-400">Cancel</Button>
                <Button
                  onClick={() => {
                    setVerifyStep(2);
                    setTimeout(handleVerifySubmit, 2000);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-11"
                  disabled={!verifyData.aadhaarLast4 || !verifyData.panNumber}
                >
                  Submit for Verification
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
