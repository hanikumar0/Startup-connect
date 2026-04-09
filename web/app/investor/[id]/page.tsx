"use client";

import { useEffect, useState, use } from "react";
import { apiFetchJSON } from "@/lib/api";
import { Loader2, Globe, Twitter, Linkedin, MapPin, Briefcase, Target, Coins, MessageSquare, Calendar, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MeetingForm from "@/components/meetings/MeetingForm";
import AiInsightPanel from "@/components/ai/AiInsightPanel";
import { useAuthStore } from "@/lib/store";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!investor) {
    return <div className="min-h-screen flex items-center justify-center">Investor not found.</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="bg-white border-b border-zinc-200 pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-32 w-32 rounded-3xl bg-zinc-100 border border-zinc-200 overflow-hidden shadow-sm shrink-0">
                    <img src={investor.logo || "/placeholder-investor.png"} alt={investor.investorName} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">{investor.investorName}</h1>
                        <Badge className="bg-indigo-50 text-indigo-600 border-none px-3 py-1 font-bold">{investor.investorType}</Badge>
                    </div>
                    <p className="text-xl text-zinc-600 font-medium max-w-3xl">{investor.firmName}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {investor.location}</span>
                        {investor.website && (
                             <Link href={investor.website} target="_blank" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                                <Globe className="h-4 w-4" /> Portfolio <ExternalLink className="h-3 w-3" />
                             </Link>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto shrink-0 pt-4">
                    <Button 
                        onClick={async () => {
                            if (!investor.userId) {
                                toast.error("This investor profile has not been claimed yet. Messaging is disabled.");
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
                        className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 font-bold shadow-lg shadow-indigo-100"
                    >
                        Send Pitch
                    </Button>
                    <Button 
                        variant="outline" 
                        className="border-zinc-200 h-11"
                        onClick={() => {
                             if (!investor.userId) {
                                  toast.error("This investor profile has not been claimed yet. Meetings are disabled.");
                                  return;
                             }
                             setIsMeetingModalOpen(true);
                        }}
                    >
                        <Calendar className="h-4 w-4 mr-2" /> Request Meeting
                    </Button>
                    {!investor.isClaimed && (
                        <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white h-11 font-bold shadow-lg shadow-amber-100"
                            onClick={async () => {
                                const res = await apiFetchJSON(`/api/claim/investor/${investor._id}`, { method: "POST" });
                                if (res.success) toast.success("Claim request submitted!");
                            }}
                        >
                            <ShieldCheck className="h-4 w-4 mr-2" /> Claim Profile
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-12">
            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-zinc-900">About the Investor</h2>
                <p className="text-zinc-600 leading-relaxed text-lg">{investor.bio}</p>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Investment Thesis</h2>
                <Card className="border-none shadow-sm bg-indigo-50/30">
                    <CardContent className="p-8">
                        <p className="text-zinc-700 italic text-lg leading-relaxed">&quot;{investor.investmentThesis}&quot;</p>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-zinc-900">Current Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {investor.portfolioCompanies?.map((company: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <div className="h-12 w-12 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center font-bold text-indigo-600">
                                {company.name[0]}
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900">{company.name}</h4>
                                <p className="text-xs text-zinc-500">{company.stage} • Invested in {company.yearInvested}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
         </div>

         <div className="space-y-8">
            {user?.role === "startup" && (
                <AiInsightPanel startupId={user.id} investorId={investor._id} />
            )}
            <Card className="border-none shadow-md bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Investment Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                            <Coins className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase">Per Deal</p>
                            <p className="text-2xl font-black text-zinc-900">${investor.checkSizeMin?.toLocaleString() || 0} - ${investor.checkSizeMax?.toLocaleString() || 0}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2"><Briefcase className="h-3 w-3" /> Focus Stages</p>
                        <div className="flex flex-wrap gap-2">
                            {investor.preferredStages?.map((stage: string) => (
                                <Badge key={stage} variant="secondary" className="bg-zinc-100 text-zinc-600 border-none">{stage}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2"><Target className="h-3 w-3" /> Focus Industries</p>
                        <div className="flex flex-wrap gap-2">
                            {investor.preferredIndustries?.map((industry: string) => (
                                <Badge key={industry} variant="secondary" className="bg-zinc-100 text-zinc-600 border-none">{industry}</Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 px-2">
                <Link href={investor.linkedin || "#"} className="text-zinc-400 hover:text-blue-600 transition-colors"><Linkedin className="h-6 w-6" /></Link>
                <Link href={investor.twitter || "#"} className="text-zinc-400 hover:text-slate-900 transition-colors"><Twitter className="h-6 w-6" /></Link>
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
