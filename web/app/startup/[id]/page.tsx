"use client";

import { useEffect, useState, use } from "react";
import { apiFetchJSON } from "@/lib/api";
import { Loader2, Globe, Twitter, Linkedin, Github, Building2, MapPin, Calendar, Users, Target, ExternalLink, Download, MessageSquare, Plus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MeetingForm from "@/components/meetings/MeetingForm";
import AiInsightPanel from "@/components/ai/AiInsightPanel";
import { useAuthStore } from "@/lib/store";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Startup Not Found</h1>
            <p className="text-zinc-500 mt-2">The startup you are looking for does not exist or is private.</p>
            <Button asChild className="mt-6 bg-indigo-600"><Link href="/discover">Back to Discover</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-zinc-200 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-32 w-32 rounded-3xl bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm shrink-0">
                    <img src={startup.logo || "/placeholder-logo.png"} alt={startup.startupName} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">{startup.startupName}</h1>
                        <Badge className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-none px-3 py-1 font-bold uppercase tracking-wider text-[10px]">{startup.stage}</Badge>
                        <Badge variant="outline" className="text-zinc-500 border-zinc-200">{startup.industry}</Badge>
                    </div>
                    <p className="text-xl text-zinc-600 font-medium max-w-3xl">{startup.tagline}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {startup.location}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Founded {startup.foundedYear}</span>
                        <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {startup.teamSize} members</span>
                        {startup.website && (
                            <Link href={startup.website} target="_blank" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                                <Globe className="h-4 w-4" /> Website <ExternalLink className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 pt-4">
                    <Button 
                        onClick={async () => {
                            if (!startup.userId) {
                                toast.error("This startup profile has not been claimed yet. Messaging is disabled.");
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
                        className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-bold shadow-lg shadow-indigo-100"
                    >
                        Send Message
                    </Button>
                    <Button 
                        variant="outline" 
                        className="border-zinc-200 h-11" 
                        onClick={() => {
                            if (!startup.userId) {
                                toast.error("This startup profile has not been claimed yet. Meetings are disabled.");
                                return;
                            }
                            setIsMeetingModalOpen(true);
                        }}
                    >
                        <Calendar className="h-4 w-4 mr-2" /> Request Meeting
                    </Button>
                    {!startup.isClaimed && (
                        <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white h-11 font-bold shadow-lg shadow-amber-100"
                            onClick={async () => {
                                const res = await apiFetchJSON(`/api/claim/startup/${startup._id}`, { method: "POST" });
                                if (res.success) toast.success("Claim request submitted!");
                            }}
                        >
                            <ShieldCheck className="h-4 w-4 mr-2" /> Claim Profile
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        className="border-zinc-200 h-11"
                        onClick={async () => {
                            const res = await apiFetchJSON("/api/save", {
                                method: "POST",
                                body: JSON.stringify({ targetId: startup._id, targetType: "startup" })
                            });
                            if (res.success) {
                                toast.success(res.saved ? "Added to collection" : "Removed from collection");
                            }
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Save
                    </Button>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-zinc-900">About the Venture</h2>
                <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed">
                    <p>{startup.description}</p>
                </div>
            </section>

            {/* Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm bg-indigo-50/50">
                    <CardContent className="p-6 space-y-3">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-indigo-900"><Target className="h-5 w-5" /> The Problem</h3>
                        <p className="text-zinc-600 text-sm leading-relaxed">{startup.problemStatement || "Problem statement not provided."}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-green-50/50">
                    <CardContent className="p-6 space-y-3">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-green-900"><Building2 className="h-5 w-5" /> Our Solution</h3>
                        <p className="text-zinc-600 text-sm leading-relaxed">{startup.solution || "Solution description not provided."}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Traction Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Traction & Growth</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Users</p>
                        <p className="text-2xl font-black text-zinc-900">{(startup.users || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Revenue</p>
                        <p className="text-2xl font-black text-zinc-900">${(startup.revenue || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Growth</p>
                        <p className="text-2xl font-black text-green-600">{startup.growthRate || "N/A"}</p>
                    </div>
                    <div className="p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm text-center">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Valuation</p>
                        <p className="text-2xl font-black text-indigo-600">${(startup.valuation || 0).toLocaleString()}</p>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Core Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {startup.teamMembers?.map((member: any, index: number) => (
                        <div key={index} className="flex gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm group hover:border-indigo-200 transition-colors">
                            <Avatar className="h-14 w-14">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-zinc-100 text-zinc-400 font-bold">{member.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-zinc-900 truncate">{member.name}</h4>
                                    <Link href={member.linkedin || "#"} className="text-zinc-400 hover:text-indigo-600"><Linkedin className="h-4 w-4" /></Link>
                                </div>
                                <p className="text-xs font-medium text-indigo-600 mb-2 uppercase tracking-wide">{member.role}</p>
                                <p className="text-sm text-zinc-500 line-clamp-2">{member.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
            {user?.role === "investor" && (
                <AiInsightPanel startupId={startup._id} investorId={user.id} />
            )}
            <Card className="border-none shadow-md overflow-hidden bg-white">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <p className="text-xs font-bold uppercase tracking-[2px] opacity-80 mb-1">Fundraising Target</p>
                    <p className="text-4xl font-black">${(startup.fundingRequired || 0).toLocaleString()}</p>
                </div>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-zinc-500 font-medium">Raised to date</span>
                            <span className="text-zinc-900 font-bold">${(startup.fundingRaised || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden border border-zinc-50">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${startup.fundingRequired ? Math.min((startup.fundingRaised / startup.fundingRequired) * 100, 100) : 0}%` }}></div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Button variant="outline" className="w-full border-zinc-200 h-11 text-zinc-700 font-bold text-sm" asChild>
                            <Link href={startup.pitchDeckUrl || "#"} target="_blank">
                                <Download className="h-4 w-4 mr-2" /> Download Pitch Deck
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full border-zinc-200 h-11 text-zinc-700 font-bold text-sm" asChild>
                            <Link href={startup.demoUrl || "#"} target="_blank">
                                <Box className="h-4 w-4 mr-2" /> View Product Demo
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-6 space-y-4">
                    <h3 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px]">Social & Community</h3>
                    <div className="flex gap-4">
                         <Link href={startup.socialLinks?.twitter || "#"} className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-slate-900 hover:text-white transition-all"><Twitter className="h-5 w-5" /></Link>
                         <Link href={startup.socialLinks?.linkedin || "#"} className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-blue-700 hover:text-white transition-all"><Linkedin className="h-5 w-5" /></Link>
                         <Link href={startup.socialLinks?.github || "#"} className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all"><Github className="h-5 w-5" /></Link>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 text-center space-y-4">
                <p className="text-sm font-medium text-indigo-900">Interested in this startup? Request a meeting with the founders via Startup Connect.</p>
                <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 shadow-lg font-bold" 
                    onClick={() => {
                        if (!startup.userId) {
                            toast.error("This startup profile has not been claimed yet. Meetings are disabled.");
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
