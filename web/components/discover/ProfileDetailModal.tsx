"use client";

import { 
    X, 
    Globe, 
    Linkedin, 
    Mail, 
    Github, 
    ShieldCheck, 
    MapPin, 
    Calendar,
    Briefcase,
    TrendingUp,
    Users,
    DollarSign,
    ExternalLink
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ProfileDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
    type: "startup" | "investor";
}

export function ProfileDetailModal({ isOpen, onClose, profile, type }: ProfileDetailModalProps) {
    if (!profile) return null;

    const metadata = profile.metadata || {};
    
    // Outreach Helpers
    const website = profile.website;
    const linkedin = profile.linkedinUrl || metadata.linkedin;
    const email = profile.email || metadata.email;
    const github = profile.source === "github" ? `https://github.com/${metadata.owner}/${profile.name}` : null;

    const renderDataField = (label: string, value: any, icon: any) => (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {icon} {label}
            </div>
            <p className={cn(
                "text-xs font-bold",
                value ? "text-slate-900" : "text-slate-300 italic font-medium"
            )}>
                {value || "Data not available"}
            </p>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[32px] bg-white shadow-2xl">
                {/* Header Section */}
                <div className="relative h-32 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-transparent" />
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-10 -mt-12 relative pb-10">
                    <div className="flex items-end justify-between mb-8">
                        <div className="h-24 w-24 rounded-[32px] bg-white border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                            {profile.logo ? (
                                <img src={profile.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <Briefcase size={32} />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Badge className="bg-slate-900 text-white border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 h-auto">
                                {profile.source || "Institutional"}
                            </Badge>
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 h-auto flex gap-1">
                                <ShieldCheck size={12} /> Verified
                            </Badge>
                        </div>
                    </div>

                    <DialogHeader className="space-y-1 mb-8 text-left">
                        <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">
                            {profile.name || profile.firm || "Unnamed Profile"}
                        </DialogTitle>
                        <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest italic">
                            #{profile.industry || "Global Market"} Sector
                        </p>
                    </DialogHeader>

                    <ScrollArea className="h-[400px] pr-6">
                        <div className="space-y-10">
                            {/* Description Section */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Institutional Abstract</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                                    {profile.description || "Detailed institutional profile text is currently under encryption or not provided by the primary source."}
                                </p>
                            </div>

                            {/* Data Grid */}
                            <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                                {type === "startup" ? (
                                    <>
                                        {renderDataField("Founder / CEO", metadata.founder || metadata.owner, <Users size={12} />)}
                                        {renderDataField("Funding Stage", profile.stage || metadata.stage, <TrendingUp size={12} />)}
                                        {renderDataField("Total Raised", metadata.funding || profile.funding, <DollarSign size={12} />)}
                                        {renderDataField("Team Size", metadata.employees || metadata.teamSize, <Users size={12} />)}
                                        {renderDataField("Launch Date", metadata.launchedDate || metadata.startDate, <Calendar size={12} />)}
                                        {renderDataField("Headquarters", profile.location || metadata.location, <MapPin size={12} />)}
                                    </>
                                ) : (
                                    <>
                                        {renderDataField("Investment Range", metadata.range || profile.funding, <DollarSign size={12} />)}
                                        {renderDataField("Funding Criteria", metadata.criteria || "Venture Focus", <TrendingUp size={12} />)}
                                        {renderDataField("Target Industries", profile.industry || "Diversified", <Briefcase size={12} />)}
                                        {renderDataField("Primary Location", profile.location || "North America", <MapPin size={12} />)}
                                        {renderDataField("Past Investments", metadata.portfolio || "Private Portfolio", <Globe size={12} />)}
                                        {renderDataField("Founded", metadata.foundedDate, <Calendar size={12} />)}
                                    </>
                                )}
                            </div>

                            {/* Outreach System */}
                            <div className="space-y-6 pt-4">
                                <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Institutional Outreach</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    {linkedin ? (
                                        <Button 
                                            onClick={() => window.open(linkedin, "_blank")}
                                            className="h-12 bg-[#0077b5] hover:bg-[#005582] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            <Linkedin size={14} /> LinkedIn
                                        </Button>
                                    ) : (
                                        <Button disabled variant="outline" className="h-12 rounded-2xl text-slate-300 border-slate-100 font-bold text-[9px] uppercase tracking-widest">
                                            No LinkedIn
                                        </Button>
                                    )}

                                    {email ? (
                                        <Button 
                                            onClick={() => window.open(`mailto:${email}`, "_blank")}
                                            className="h-12 bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm rounded-2xl font-bold text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            <Mail size={14} /> Gmail
                                        </Button>
                                    ) : (
                                        <Button disabled variant="outline" className="h-12 rounded-2xl text-slate-300 border-slate-100 font-bold text-[9px] uppercase tracking-widest">
                                            No Email
                                        </Button>
                                    )}

                                    {github ? (
                                        <Button 
                                            onClick={() => window.open(github, "_blank")}
                                            className="h-12 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            <Github size={14} /> GitHub
                                        </Button>
                                    ) : null}

                                    {website && (
                                        <Button 
                                            onClick={() => window.open(website, "_blank")}
                                            variant="ghost"
                                            className="h-12 text-slate-400 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-widest gap-2"
                                        >
                                            <ExternalLink size={14} /> Entry Point
                                        </Button>
                                    )}
                                </div>
                                <p className="text-[9px] font-medium text-slate-400 italic">
                                    * Outreach options are verified based on real institutional data availability.
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
