"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    MoreVertical,
    IndianRupee,
    Target,
    Zap,
    ChevronRight,
    Search,
    Filter,
    Loader2,
    Calendar,
    ArrowRightCircle,
    CheckCircle2,
    XCircle,
    User,
    CircleDashed,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const STAGES = [
    { id: "PROSPECT", label: "PROSPECT", color: "text-slate-500", bg: "bg-slate-100" },
    { id: "CONTACTED", label: "CONTACTED", color: "text-blue-600", bg: "bg-blue-50" },
    { id: "DILIGENCE", label: "DILIGENCE", color: "text-indigo-600", bg: "bg-indigo-50" },
    { id: "TERM_SHEET", label: "TERM_SHEET", color: "text-purple-600", bg: "bg-purple-50" },
    { id: "CLOSED", label: "CLOSED", color: "text-emerald-600", bg: "bg-emerald-50" }
];

export default function PipelinePage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const loadAll = async () => {
            await Promise.all([fetchDeals(), fetchProfile()]);
            setIsLoading(false);
        };
        loadAll();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiFetch("/api/users/profile");
            const data = await response.json();
            if (data.success) {
                setProfile(data.profile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchDeals = async () => {
        try {
            const response = await apiFetch("/api/deals");
            const data = await response.json();
            if (data.success) {
                setDeals(data.deals);
            }
        } catch (error) {
            console.error("Error fetching deals:", error);
        }
    };

    const handleMoveStage = async (dealId: string, currentStage: string) => {
        const nextStageMap: any = {
            "PROSPECT": "CONTACTED",
            "CONTACTED": "DILIGENCE",
            "DILIGENCE": "TERM_SHEET",
            "TERM_SHEET": "CLOSED"
        };
        const nextStage = nextStageMap[currentStage];
        if (!nextStage) return;

        try {
            const response = await apiFetch(`/api/deals/${dealId}/stage`, {
                method: "PUT",
                body: JSON.stringify({ stage: nextStage }),
            });
            const data = await response.json();
            if (data.success) {
                setDeals(prev => prev.map(d => d._id === dealId ? { ...d, stage: nextStage } : d));
            }
        } catch (error) {
            console.error("Error moving deal:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <CircleDashed className="h-12 w-12 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Parsing Pipeline Data...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 px-1"
        >
            {/* Breadcrumb Console */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Treasury Management</span>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Capital Pipeline</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">
                        FLOW<span className="text-indigo-600">.</span>CONTROL
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic max-w-xl">
                        Monitor active capital acquisition and strategic venture lead progression.
                    </p>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">PIPELINE TERMINAL GOAL</p>
                        <p className="text-4xl font-black text-indigo-600 tracking-tighter leading-none">
                            ₹{profile?.fundingRequired ? (profile.fundingRequired / 10000000).toFixed(1) : "0.0"}Cr
                        </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="h-16 px-8 bg-black hover:bg-slate-900 text-white rounded-[28px] shadow-2xl shadow-indigo-100 gap-3 border-none ring-offset-4 hover:ring-2 ring-black transition-all">
                            <Plus className="h-5 w-5" />
                            <span className="font-bold text-lg uppercase tracking-tight">ADD LEAD</span>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Kanban Board Layout */}
            <div className="flex gap-8 overflow-x-auto pb-12 min-h-[75vh] -mx-4 px-4 scrollbar-hide">
                {STAGES.map((stage, sIdx) => {
                    const stageDeals = deals.filter(d => d.stage === stage.id);
                    const totalAmount = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

                    return (
                        <motion.div 
                            key={stage.id} 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sIdx * 0.1 }}
                            className="flex-shrink-0 w-[340px] flex flex-col gap-6"
                        >
                            <div className="flex items-end justify-between px-3 border-b-2 border-slate-100 pb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-slate-900 tracking-tighter uppercase italic">{stage.label}</h3>
                                        <Badge className={`rounded-lg px-2 py-0 font-black text-[10px] border-none ${stage.bg} ${stage.color}`}>
                                            {stageDeals.length}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-70">CURRENT VECTOR</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-900 leading-none">₹{(totalAmount / 10000000).toFixed(1)}Cr</p>
                                    <p className="text-[9px] font-black text-slate-400 tracking-widest mt-1">TOTAL_RESERVE</p>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 bg-slate-50/30 rounded-[40px] border border-slate-100/50 p-4 shadow-inner">
                                <div className="space-y-4">
                                    <AnimatePresence mode="popLayout">
                                        {stageDeals.map((deal, dIdx) => (
                                            <motion.div
                                                key={deal._id}
                                                layout
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                            >
                                                <Card className="rounded-[32px] border-none shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-white overflow-hidden border border-slate-50">
                                                    <CardContent className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:rotate-12 transition-all duration-500">
                                                                <User className="h-7 w-7 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-200 hover:text-slate-600 rounded-xl">
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-1 mb-6">
                                                            <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{deal.investor?.name || deal.investorProfile?.firmName || "SECURE_OBJECT"}</h4>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic opacity-70">
                                                                {deal.investorProfile?.investorType || "PRIVATE EQUITY"}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group-hover:bg-indigo-50/30 transition-colors duration-500">
                                                            <div className="space-y-0.5">
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">OFFER_VOLUME</p>
                                                                <div className="flex items-center gap-1">
                                                                    <IndianRupee className="h-3.5 w-3.5 text-emerald-600" strokeWidth={3} />
                                                                    <span className="text-lg font-black text-slate-900 tracking-tight">₹{(deal.amount / 100000).toFixed(0)}L</span>
                                                                </div>
                                                            </div>
                                                            {stage.id !== "CLOSED" && (
                                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-10 w-10 rounded-full bg-white text-indigo-600 shadow-sm hover:bg-black hover:text-white transition-all cursor-pointer"
                                                                        onClick={() => handleMoveStage(deal._id, deal.stage)}
                                                                    >
                                                                        <ChevronRight className="h-5 w-5" strokeWidth={3} />
                                                                    </Button>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {stageDeals.length === 0 && (
                                        <div className="py-20 text-center border-4 border-dashed border-white rounded-[32px] opacity-30 group shadow-inner">
                                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                                                <Plus className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Station Empty</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </motion.div>
                    );
                })}

                {/* Initializing Column */}
                <div className="flex-shrink-0 w-[40px] flex items-center justify-center">
                    <div className="h-3/4 w-px bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
                </div>
            </div>
        </motion.div>
    );
}
