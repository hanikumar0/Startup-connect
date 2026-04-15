"use client";

import { useEffect, useState, use } from "react";
import { apiFetchJSON } from "@/lib/api";
import { 
    Loader2, Globe, Twitter, Linkedin, Github, Building2, MapPin, 
    Calendar, Users, Target, ExternalLink, Download, MessageSquare, 
    Plus, Box, ShieldCheck, Zap, Verified, TrendingUp, Briefcase, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MeetingForm from "@/components/meetings/MeetingForm";
import AiInsightPanel from "@/components/ai/AiInsightPanel";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function StartupPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [startup, setStartup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    async function fetchStartup() {
      try {
        const data = await apiFetchJSON(`/api/startup/${id}`);
        if (data.success) {
          setStartup(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch startup", err);
      } finally {
        setIsLoading(false);
      }
    }

    async function trackView() {
        try {
            await apiFetchJSON("/api/save/recent", {
                method: "POST",
                body: JSON.stringify({ targetId: id, targetType: "startup" })
            });
        } catch (err) {
            console.error("Failed to track view", err);
        }
    }
    fetchStartup();
    trackView();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-16 w-16 rounded-[24px] bg-indigo-600 animate-pulse shadow-2xl shadow-indigo-200 flex items-center justify-center">
            <Zap className="text-white h-8 w-8" />
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center p-12 bg-white rounded-[40px] shadow-2xl border-2 border-slate-100 max-w-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                <Search size={40} />
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
       {/* PREMIUM HERO SECTION */}
       <div className="relative bg-white pt-32 pb-20 border-b-2 border-slate-100 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(79,70,229,0.05)_0%,_transparent_100%)] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Logo Stack */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative shrink-0"
                >
                    <div className="h-40 w-40 rounded-[48px] bg-slate-50 border-4 border-white shadow-2xl shadow-indigo-100 flex items-center justify-center overflow-hidden">
                        <img src={startup.logo || "/placeholder-logo.png"} alt={startup.startupName} className="h-full w-full object-contain p-4" />
                    </div>
                    {!startup.isClaimed && (
                         <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-black text-[9px] uppercase px-4 py-2 rounded-xl shadow-xl italic tracking-widest whitespace-nowrap">
                            Unclaimed Profile
                        </div>
                    )}
                </motion.div>

                <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">{startup.startupName}</h1>
                        <Badge className="bg-indigo-600 text-white border-none font-black px-4 py-2 text-[10px] uppercase tracking-[3px] italic h-8">
                            {startup.stage}
                        </Badge>
                        <Badge variant="outline" className="text-slate-400 border-2 border-slate-100 font-black px-4 h-8 uppercase text-[10px] tracking-widest">
                            {startup.industry}
                        </Badge>
                    </div>
                    <p className="text-2xl font-bold text-slate-500 italic max-w-4xl tracking-tight leading-snug">
                       {startup.tagline}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-8 text-[11px] font-black text-slate-400 uppercase tracking-[3px] pt-4">
                        <span className="flex items-center gap-2 group cursor-default"><MapPin className="h-4 w-4 text-indigo-600 group-hover:scale-125 transition-transform" /> {startup.location}</span>
                        <span className="flex items-center gap-2群 cursor-default"><Calendar className="h-4 w-4 text-indigo-600 group-hover:scale-125 transition-transform" /> Founded {startup.foundedYear}</span>
                        <span className="flex items-center gap-2群 cursor-default"><Users className="h-4 w-4 text-indigo-600 group-hover:scale-125 transition-transform" /> {startup.teamSize} Originators</span>
                        {startup.website && (
                            <Link href={startup.website} target="_blank" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:scale-105 transition-all">
                                <Globe className="h-4 w-4" /> Official Site <ExternalLink className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                </div>

                {/* Hero Actions */}
                <div className="flex flex-col gap-4 w-full md:w-64 pt-6">
                    <Button 
                        onClick={async () => {
                            if (!startup.userId) {
                                toast.error("This startup profile has not been claimed yet.");
                                return;
                            }
                            const targetId = typeof startup.userId === 'object' ? startup.userId._id : startup.userId;
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
                        Send Direct Message
                    </Button>
                    <Button 
                        variant="outline" 
                        className="bg-white border-2 border-slate-100 h-14 rounded-[20px] font-black uppercase text-xs tracking-widest italic hover:bg-slate-50 transition-all hover-lift" 
                        onClick={() => {
                            if (!startup.userId) {
                                toast.error("Profile unclaimed. Meetings disabled.");
                                return;
                            }
                            setIsMeetingModalOpen(true);
                        }}
                    >
                        <Calendar className="h-4 w-4 mr-3" /> Request Session
                    </Button>
                </div>
            </div>
        </div>
       </div>

       <div className="max-w-6xl mx-auto px-6 mt-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-20">
            {/* CORE DESCRIPTION */}
            <section className="space-y-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[5px] italic">Institutional Overview</h2>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="text-xl font-bold text-slate-500 leading-relaxed italic opacity-90">
                    {startup.description}
                </div>
            </section>

            {/* PROBLEM / SOLUTION DYNAMIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 rounded-[40px] bg-slate-900 text-white relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <Target size={120} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-[5px] text-indigo-400 mb-8">The Disturbance</h3>
                     <p className="text-lg font-bold leading-relaxed italic opacity-90">{startup.problemStatement || "Analytical data pending."}</p>
                </div>
                <div className="p-10 rounded-[40px] bg-white border-2 border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700 text-indigo-600">
                        <Zap size={120} />
                     </div>
                     <h3 className="text-[11px] font-black uppercase tracking-[5px] text-slate-300 mb-8">The Resolution</h3>
                     <p className="text-lg font-bold leading-relaxed italic text-slate-600">{startup.solution || "Systematic resolution pending."}</p>
                </div>
            </div>

            {/* TRACTION METRICS */}
            <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[5px] italic">Proof of Concept</h2>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-8 bg-white rounded-3xl border-2 border-slate-50 shadow-sm text-center group hover:border-indigo-100 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Network Nodes</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-indigo-600">{(startup.users || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-8 bg-white rounded-3xl border-2 border-slate-50 shadow-sm text-center group hover:border-indigo-100 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Capital Alpha</p>
                        <p className="text-3xl font-black text-slate-900 group-hover:text-indigo-600">${(startup.revenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-8 bg-white rounded-3xl border-2 border-slate-50 shadow-sm text-center group hover:border-indigo-100 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Growth Rate</p>
                        <p className="text-3xl font-black text-emerald-600">{startup.growthRate || "0.0%"}</p>
                    </div>
                    <div className="p-8 bg-white rounded-3xl border-2 border-slate-50 shadow-sm text-center group hover:border-indigo-100 transition-all">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Valuation</p>
                        <p className="text-3xl font-black text-indigo-600">${(startup.valuation || 0).toLocaleString()}</p>
                    </div>
                </div>
            </section>

            {/* TEAM ARCHITECTURE */}
            <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-[5px] italic">Core Architecture</h2>
                    <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {startup.teamMembers?.map((member: any, index: number) => (
                        <div key={index} className="flex gap-6 p-8 bg-white rounded-[40px] border-2 border-slate-50 shadow-sm group hover:border-indigo-200 transition-all hover:shadow-2xl hover:shadow-indigo-50/50">
                            <div className="relative">
                                <Avatar className="h-20 w-20 rounded-3xl border-4 border-white shadow-xl">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback className="bg-slate-100 text-slate-400 font-extrabold text-xl italic">{member.name[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-black text-xl text-slate-900 italic tracking-tight uppercase truncate">{member.name}</h4>
                                    <Link href={member.linkedin || "#"} className="text-slate-300 hover:text-indigo-600 transition-colors"><Linkedin size={18} /></Link>
                                </div>
                                <p className="text-[10px] font-bold text-indigo-600 mb-4 uppercase tracking-[4px] italic">{member.role}</p>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed italic line-clamp-2">{member.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* UNIFIED SIDEBAR */}
        <div className="lg:col-span-4 space-y-12">
            {/* AI ANALYTICS PANORAMA */}
            {user?.role === "investor" && (
                <AiInsightPanel startupId={startup._id} investorId={user.id} />
            )}

            {/* CAPITAL STACK WIDGET */}
            <Card className="border-2 border-slate-100 shadow-2xl shadow-indigo-50/50 rounded-[40px] overflow-hidden bg-white">
                <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                        <TrendingUp size={80} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[5px] text-indigo-400 mb-4 italic">Capital Required</p>
                    <p className="text-5xl font-black italic tracking-tighter">${(startup.fundingRequired || 0).toLocaleString()}</p>
                </div>
                <CardContent className="p-10 space-y-10">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest italic">
                            <span className="text-slate-400">Raised Liquidity</span>
                            <span className="text-slate-900">${(startup.fundingRaised || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 rounded-2xl overflow-hidden p-1 shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${startup.fundingRequired ? Math.min((startup.fundingRaised / startup.fundingRequired) * 100, 100) : 0}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200"
                            />
                        </div>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-[3px] text-center">
                            {Math.round(startup.fundingRequired ? (startup.fundingRaised / startup.fundingRequired) * 100 : 0)}% Commitment Reached
                        </p>
                    </div>

                    <div className="pt-6 space-y-4">
                        <Button variant="outline" className="w-full border-2 border-slate-100 h-16 rounded-2xl font-black uppercase text-[10px] tracking-[4px] italic hover:bg-slate-50 transition-all hover-lift" asChild>
                            <Link href={startup.pitchDeckUrl || "#"} target="_blank">
                                <Download className="h-4 w-4 mr-3 text-indigo-600" /> Review Pitch Deck
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full border-2 border-slate-100 h-16 rounded-2xl font-black uppercase text-[10px] tracking-[4px] italic hover:bg-slate-50 transition-all hover-lift" asChild>
                            <Link href={startup.demoUrl || "#"} target="_blank">
                                <Box className="h-4 w-4 mr-3 text-indigo-600" /> Visual Product Demo
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* INSTITUTIONAL SOCIALS */}
            <Card className="border-2 border-slate-100 shadow-sm rounded-[40px] bg-white">
                <CardContent className="p-8 space-y-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-[4px] text-[10px] italic">Institutional Socials</h3>
                    <div className="grid grid-cols-3 gap-6">
                         <Link href={startup.socialLinks?.twitter || "#"} className="h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl"><Twitter size={20} /></Link>
                         <Link href={startup.socialLinks?.linkedin || "#"} className="h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 hover:bg-[#0077b5] hover:text-white transition-all shadow-sm hover:shadow-xl"><Linkedin size={20} /></Link>
                         <Link href={startup.socialLinks?.github || "#"} className="h-14 bg-slate-50 rounded-[20px] flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm hover:shadow-xl"><Github size={20} /></Link>
                    </div>
                </CardContent>
            </Card>

            <div className="p-10 bg-indigo-600 rounded-[48px] text-white text-center space-y-6 shadow-2xl shadow-indigo-200 group">
                <p className="text-[10px] font-black uppercase tracking-[5px] opacity-70">Handshake Required</p>
                <p className="text-xl font-black italic tracking-tight">Request direct alignment with the founders via Startup Connect.</p>
                <Button 
                    className="w-full bg-white hover:bg-slate-50 text-indigo-600 h-16 rounded-[24px] font-black uppercase tracking-[5px] italic text-xs shadow-xl transition-all hover-lift" 
                    onClick={() => {
                        if (!startup.userId) {
                            toast.error("Profile unclaimed.");
                            return;
                        }
                        setIsMeetingModalOpen(true);
                    }}
                >
                    Request Meeting
                </Button>
            </div>
         </div>
       </div>

       <MeetingForm 
        isOpen={isMeetingModalOpen} 
        onClose={() => setIsMeetingModalOpen(false)} 
        targetId={startup.userId ? (typeof startup.userId === 'object' ? startup.userId._id : startup.userId) : ''} 
        targetType="startup"
      />
    </div>
  );
}
