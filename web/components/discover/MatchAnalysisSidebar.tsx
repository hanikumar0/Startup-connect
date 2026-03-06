"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BrainCircuit, Target, Zap, ShieldCheck, AlertCircle, TrendingUp, Lock, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiFetch } from "@/lib/api";

interface MatchAnalysisSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
}

export function MatchAnalysisSidebar({ isOpen, onClose, profile }: MatchAnalysisSidebarProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);

    useEffect(() => {
        if (isOpen && profile?.userId?._id) {
            fetchDocs(profile.userId._id);
        }
    }, [isOpen, profile]);

    const fetchDocs = async (startupId: string) => {
        setIsLoadingDocs(true);
        try {
            const res = await apiFetch(`/api/vdr/startup/${startupId}`);
            const data = await res.json();
            if (data.success) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const requestAccess = async (docId: string) => {
        try {
            const res = await apiFetch(`/api/vdr/request/${docId}`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setDocuments(prev => prev.map(d => d._id === docId ? { ...d, requestStatus: "PENDING" } : d));
            }
        } catch (error) { }
    }

    if (!profile) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] overflow-y-auto"
                    >
                        <div className="p-8 space-y-8">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">AI Match Analysis</h2>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Deep Insight Report</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                    <X size={20} />
                                </Button>
                            </div>

                            {/* Score Card */}
                            <div className="p-6 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                    <Target size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black">94%</span>
                                        <span className="text-indigo-200 font-bold">Match Strength</span>
                                    </div>
                                    <Progress value={94} className="h-2 bg-indigo-400 mt-4" />
                                    <p className="text-sm text-indigo-100 mt-4 leading-relaxed font-medium">
                                        "High synergy detected. Their industry focus and funding stage perfectly align with your investment thesis."
                                    </p>
                                </div>
                            </div>

                            {/* Analysis Grid */}
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Key Synergy Points</h3>
                                <div className="grid gap-4">
                                    {[
                                        { icon: Zap, label: "Sector Alignment", value: "Exact Match", color: "text-amber-500", bg: "bg-amber-50" },
                                        { icon: TrendingUp, label: "Growth Potential", value: "Exceptional", color: "text-emerald-500", bg: "bg-emerald-50" },
                                        { icon: ShieldCheck, label: "Trust Score", value: "Verified Founder", color: "text-blue-500", bg: "bg-blue-50" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                                                    <item.icon size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                            </div>
                                            <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">AI Observations</h3>
                                <div className="p-5 rounded-2xl border border-rose-100 bg-rose-50/30 flex gap-4">
                                    <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-rose-900">Competitive Landscape</p>
                                        <p className="text-xs text-rose-800 leading-relaxed mt-1">
                                            While their tech is unique, the market has 3 major incumbents. Their moat depends heavily on the pending patent.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* VDR Access */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Virtual Data Room</h3>
                                {isLoadingDocs ? (
                                    <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
                                ) : documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <div key={doc._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{doc.category}</p>
                                                    </div>
                                                </div>
                                                {!doc.hasAccess ? (
                                                    doc.requestStatus === "PENDING" ? (
                                                        <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1">Pending Approval</Badge>
                                                    ) : doc.requestStatus === "REJECTED" ? (
                                                        <Badge className="bg-red-50 text-red-600 border-none px-3 py-1">Access Denied</Badge>
                                                    ) : (
                                                        <Button size="sm" variant="outline" className="h-8 gap-2 text-indigo-600 border-indigo-100 hover:bg-indigo-50" onClick={() => requestAccess(doc._id)}>
                                                            <Lock size={12} /> Request Access
                                                        </Button>
                                                    )
                                                ) : (
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                                                        <Download size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                                        <ShieldCheck size={24} className="mx-auto text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-500 font-medium">No documents uploaded to VDR yet.</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Button */}
                            <div className="pt-4">
                                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-100 transition-all">
                                    Generate Full Due-Diligence
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
