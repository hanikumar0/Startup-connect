"use client";

import { useState, useEffect } from "react";
import {
    X,
    ShieldCheck,
    History,
    TrendingUp,
    AlertTriangle,
    Award,
    Loader2,
    ArrowUpRight,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiFetch } from "@/lib/api";

interface HistoryAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    entityName: string;
    entityType: "STARTUP" | "INVESTOR";
    founderName?: string;
}

export function HistoryAuditModal({
    isOpen,
    onClose,
    entityName,
    entityType,
    founderName
}: HistoryAuditModalProps) {
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAudit();
        }
    }, [isOpen, entityName]);

    const fetchAudit = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch("/api/verify/deep-audit", {
                method: "POST",
                body: JSON.stringify({ entityName, entityType, founderName })
            });
            const data = await response.json();
            if (data.success) {
                setReport(data.data);
            } else {
                setError(data.message || "Failed to fetch audit report");
            }
        } catch (err) {
            console.error("Audit Error:", err);
            setError("An error occurred while fetching the audit report.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-slate-900">AI Transparency Report</DialogTitle>
                                <DialogDescription className="text-slate-500 text-xs mt-0.5">External verification and deep history audit</DialogDescription>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                            <div className="text-center">
                                <p className="font-bold text-slate-900 text-lg">AI performing deep history audit...</p>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">Checking external funding records, past ventures, and industry reputation.</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                            <div>
                                <p className="font-bold text-slate-900 text-lg">Audit Failed</p>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">{error}</p>
                            </div>
                            <Button onClick={fetchAudit} variant="outline" className="mt-4">Try Again</Button>
                        </div>
                    ) : (
                        <div className="space-y-8 pb-8">
                            {/* Score Card */}
                            <div className="flex items-center gap-6 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
                                <div className="h-24 w-24 rounded-full border-8 border-indigo-600 flex flex-col items-center justify-center bg-white shadow-inner">
                                    <span className="text-2xl font-black text-indigo-600">{report.trustScore}</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Trust Score</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{entityName}</h3>
                                    <div className="flex items-center gap-3 mt-3">
                                        <Badge className={`${report.riskAssessment === 'Low' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-red-100 text-red-700 hover:bg-red-100'} border-none px-3 py-1 font-bold text-[10px] uppercase tracking-wider`}>
                                            {report.riskAssessment} Risk
                                        </Badge>
                                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <Award className="h-5 w-5" />
                                    <h4 className="text-sm font-black uppercase tracking-widest">Strategic Summary</h4>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {report.summary}
                                </p>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Funding History */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <TrendingUp className="h-5 w-5" />
                                    <h4 className="text-sm font-black uppercase tracking-widest">External Funding History</h4>
                                </div>
                                <div className="grid gap-4">
                                    {report.pastFunding.map((item: any, idx: number) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-200 transition-colors shadow-sm">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{item.year} • {item.round}</span>
                                                    <span className="text-sm font-black text-slate-900">{item.amount}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 font-bold">via {item.source}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            {/* Track Record */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-amber-600">
                                    <History className="h-5 w-5" />
                                    <h4 className="text-sm font-black uppercase tracking-widest">Track Record</h4>
                                </div>
                                <div className="grid gap-3">
                                    {report.founderTrackRecord.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-amber-600 rounded-lg text-white shadow-md">
                                                    <Award className="h-3 w-3" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">{item.company}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{item.role}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
                                                {item.outcome}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Section */}
                            <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-900 space-y-3">
                                <div className="flex items-center gap-2 text-red-600">
                                    <AlertTriangle className="h-5 w-5" />
                                    <h4 className="text-sm font-black uppercase tracking-widest">Risk Assessment</h4>
                                </div>
                                <p className="text-xs leading-relaxed font-bold opacity-80 italic">
                                    {report.riskNotes}
                                </p>
                            </div>
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        AI Verified External Audit • Immutable Report
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Button } from "@/components/ui/button";
