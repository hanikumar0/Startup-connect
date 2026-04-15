"use client";

import { useEffect, useState, use } from "react";
import { apiFetchJSON } from "@/lib/api";
import { 
    Loader2, Globe, Twitter, Linkedin, Github, Building2, MapPin, 
    Calendar, Users, Target, ExternalLink, Download, MessageSquare, 
    Plus, Box, ShieldCheck, Zap, Verified, TrendingUp, Briefcase, Search, Coins, PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MeetingForm from "@/components/meetings/MeetingForm";
import AiInsightPanel from "@/components/ai/AiInsightPanel";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function InvestorPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [investor, setInvestor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchInvestor() {
      try {
        const data = await apiFetchJSON(`/api/investor/${id}`);
        if (data.success) {
          setInvestor(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch investor", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvestor();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-16 w-16 rounded-[24px] bg-slate-900 animate-pulse shadow-2xl shadow-slate-200 flex items-center justify-center">
            <TrendingUp className="text-white h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center p-12 bg-white rounded-[40px] shadow-2xl border-2 border-slate-100 max-w-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Briefcase size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 italic uppercase">Not Found.</h1>
            <p className="text-slate-400 font-bold mt-4 uppercase text-[10px] tracking-[3px]">Institutional data is missing or restricted.</p>
            <Button asChild className="mt-8 bg-slate-900 h-14 w-full rounded-2xl font-black uppercase tracking-widest italic text-xs"><Link href="/discover">Back to Discovery</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32">
       {/* PREMIUM HERO SECTION (SAME AS STARTUP) */}
       <div className="relative bg-white pt-32 pb-20 border-b-2 border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(30,41,59,0.05)_0%,_transparent_100%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Logo Stack */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative shrink-0"
                >
                    <div className="h-40 w-40 rounded-[48px] bg-slate-50 border-4 border-white shadow-2xl shadow-slate-100 flex items-center justify-center overflow-hidden">
                        <img src={investor.logo || "/placeholder-investor.png"} alt={investor.investorName} className="h-full w-full object-contain p-4" />
                    </div>
                    {!investor.isClaimed && (
                         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-[9px] uppercase px-4 py-2 rounded-xl shadow-xl italic tracking-widest whitespace-nowrap">
                            Unclaimed Desk
                        </div>
                    )}
                </motion.div>

                <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">{investor.investorName}</h1>
                        <Badge className="bg-slate-900 text-white border-none font-black px-4 py-2 text-[10px] uppercase tracking-[3px] italic h-8">
                            {investor.investorType}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-2 border-slate-100 font-black px-4 h-8 uppercase text-[10px] tracking-widest">
                            {investor.firmName}
                        </Badge>
                    </div>
                    <p className="text-2xl font-bold text-slate-500 italic max-w-4xl tracking-tight leading-snug">
                       {(investor.investmentThesis || "").substring(0, 160)}...
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[3px] pt-4">
                        <span className="flex items-center gap-2 group cursor-default"><MapPin className="h-4 w-4 text-slate-900 group-hover:scale-125 transition-transform" /> {investor.location}</span>
                        <span className="flex items-center gap-2群 cursor-default"><Building2 className="h-4 w-4 text-slate-900 group-hover:scale-125 transition-transform" /> {investor.firmName}</span>
                        {investor.website && (
                             <Link href={investor.website} target="_blank" className="flex items-center gap-2 text-slate-900 font-black hover:text-indigo-600 hover:scale-105 transition-all">
                                <Globe className="h-4 w-4" /> Capital Portal <ExternalLink className="h-3 w-3" />
                             </Link>
                        )}
                    </div>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-col gap-4 w-full md:w-64 pt-6">
                    <Button 
                        onClick={async () => {
                            if (!investor.userId) {
                                toast.error("This investor profile has not been claimed yet.");
                                return;
                            }
                            const targetId = typeof investor.userId === 'object' ? investor.userId._id : investor.userId;
                            const data = await apiFetchJSON("/api/messages/conversation", {
                                method: "POST",
                                body: JSON.stringify({ participantId: targetId })
                            });
                            if (data.success) {
                                window.location.href = "/messages";
                            }
                        }}
                        className="bg-slate-900 hover:bg-black text-white h-14 rounded-[20px] font-black uppercase text-xs tracking-widest italic shadow-2xl shadow-slate-200 transition-all hover-lift"
                    >
                        Send Pitch Request
                    </Button>
                    <Button 
                        variant="outline" 
                        className="bg-white border-2 border-slate-100 h-14 rounded-[20px] font-black uppercase text-xs tracking-widest italic hover:bg-slate-50 transition-all hover-lift" 
                        onClick={() => {
                            if (!investor.userId) {
                                toast.error("Desk unclaimed. Sessions disabled.");
                                return;
                            }
                            setIsMeetingModalOpen(true);
                        }}
                    >
                        <Calendar className="h-4 w-4 mr-3" /> Request Review
                    </Button>
                </div>
            </div>
        </div>
       </div>

       <div className="max-w-6xl mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
         <div className="lg:col-span-8 space-y-20">
            {/* CORE BIO SECTION */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[5px] italic">Institutional Bio</h2>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="text-xl font-bold text-slate-500 leading-relaxed italic opacity-90">
                    {investor.bio}
                </div>
            </section>

            {/* INVESTMENT THESIS (REPLACING PROBLEM/SOLUTION) */}
            <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[5px] italic">Investment Thesis</h2>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="p-12 rounded-[48px] bg-slate-900 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <Target size={150} />
                     </div>
                     <p className="text-2xl font-black italic tracking-tight leading-relaxed relative z-10">
                        &quot;{investor.investmentThesis}&quot;
                     </p>
                     <div className="mt-8 flex gap-3 relative z-10">
                        <Badge className="bg-indigo-600 text-white font-black text-[9px] uppercase h-6 px-3 tracking-widest">Active Deployments</Badge>
                     </div>
                </div>
            </section>

            {/* PORTFOLIO COMPANIES */}
            <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[5px] italic">Active Allocation</h2>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {investor.portfolioCompanies?.map((company: any, index: number) => (
                        <div key={index} className="flex gap-6 p-8 bg-white rounded-[40px] border-2 border-slate-50 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-50/50">
                            <div className="h-16 w-16 bg-slate-50 rounded-2xl border-2 border-white shadow-lg flex items-center justify-center text-slate-900 font-black text-xl italic shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                {company.name[0]}
                            </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-black text-lg text-slate-900 italic tracking-tight uppercase truncate">{company.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-[3px] italic">{company.stage}</p>
                                <p className="text-[9px] font-black text-indigo-600 mt-1 uppercase tracking-widest">Invested {company.yearInvested}</p>
                            </div>
                        </div>
                    ))}
                    {(!investor.portfolioCompanies || investor.portfolioCompanies.length === 0) && (
                         <div className="md:col-span-2 p-12 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-center">
                            <p className="text-slate-300 font-black uppercase text-[10px] tracking-[5px]">History Under Institutional Audit</p>
                         </div>
                    )}
                </div>
            </section>
         </div>

         {/* UNIFIED SIDEBAR (REPLICATING STARTUP SIDEBAR) */}
         <div className="lg:col-span-4 space-y-12">
            {/* AI ANALYTICS PANORAMA */}
            {user?.role === "startup" && (
                <AiInsightPanel startupId={user.id} investorId={investor._id} />
            )}

            {/* CAPITAL ALLOCATION WIDGET */}
            <Card className="border-2 border-slate-100 shadow-2xl shadow-slate-100 rounded-[40px] overflow-hidden bg-white">
                <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <Coins size={80} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[5px] text-indigo-400 mb-4 italic">Deployment Range</p>
                    <p className="text-3xl font-black italic tracking-tighter hover:scale-105 transition-transform cursor-default">
                        ${investor.checkSizeMin?.toLocaleString() || 0} - ${(investor.checkSizeMax || 0).toLocaleString()}
                    </p>
                </div>
                <CardContent className="p-10 space-y-10">
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 italic">
                               <PieChart size={12} className="text-indigo-600" /> Focus Stages
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {investor.preferredStages?.map((stage: string) => (
                                    <Badge key={stage} className="bg-slate-50 text-slate-900 border-none font-black text-[9px] uppercase h-6 px-3 tracking-widest italic">{stage}</Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 italic">
                               <Briefcase size={12} className="text-indigo-600" /> Preferred Industries
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {investor.preferredIndustries?.map((industry: string) => (
                                    <Badge key={industry} className="bg-slate-50 text-slate-900 border-none font-black text-[9px] uppercase h-6 px-3 tracking-widest italic">{industry}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <p className="text-[9px] font-black text-emerald-600 bg-emerald-50 py-3 rounded-2xl text-center uppercase tracking-[4px] border border-emerald-100 italic">
                            Verified Liquidity Desk
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* INSTITUTIONAL SOCIALS */}
            <Card className="border-2 border-slate-100 shadow-sm rounded-[40px] bg-white">
                <CardContent className="p-8 space-y-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-[4px] text-[10px] italic">Institutional Socials</h3>
                    <div className="grid grid-cols-2 gap-6">
                         <Link href={investor.linkedin || "#"} className="h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all shadow-sm hover:shadow-xl"><Linkedin size={24} /></Link>
                         <Link href={investor.twitter || "#"} className="h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl"><Twitter size={24} /></Link>
                    </div>
                </CardContent>
            </Card>

            <div className="p-10 bg-slate-900 rounded-[48px] text-white text-center space-y-6 shadow-2xl shadow-slate-200 group">
                <p className="text-[10px] font-black uppercase tracking-[5px] opacity-70">Handshake Required</p>
                <p className="text-xl font-black italic tracking-tight">Request an institutional review of your pitch through Startup Connect.</p>
                <Button 
                    className="w-full bg-white hover:bg-slate-50 text-slate-900 h-16 rounded-[24px] font-black uppercase tracking-[5px] italic text-xs shadow-xl transition-all hover-lift" 
                    onClick={() => {
                        if (!investor.userId) {
                            toast.error("Desk unclaimed.");
                            return;
                        }
                        setIsMeetingModalOpen(true);
                    }}
                >
                    Request Review
                </Button>
            </div>
         </div>
       </div>

       <MeetingForm 
        isOpen={isMeetingModalOpen} 
        onClose={() => setIsMeetingModalOpen(false)} 
        targetId={investor.userId ? (typeof investor.userId === 'object' ? investor.userId._id : investor.userId) : ''} 
        targetType="investor"
      />
    </div>
  );
}
