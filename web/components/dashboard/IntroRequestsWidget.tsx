
"use client";

import { useEffect, useState } from "react";
import { Users, Check, X, Loader2, ArrowRight, MessageSquare, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function IntroRequestsWidget({ role }: { role: string }) {
    const [data, setData] = useState<{ requested: any[], asConnector: any[] }>({ requested: [], asConnector: [] });
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchIntros();
    }, []);

    const fetchIntros = async () => {
        setLoading(true);
        try {
            const res = await apiFetchJSON("/api/intros/my-requests");
            if (res.success) setData(res.data);
        } catch (err) {
            console.error("Intros fetch fail", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (requestId: string, status: string) => {
        setProcessingId(requestId);
        try {
            const res = await apiFetchJSON("/api/intros/respond", {
                method: "POST",
                body: JSON.stringify({ introRequestId: requestId, status })
            });
            if (res.success) {
                toast.success(status === "CO_ACCEPTED" ? "Introduction shared!" : "Request declined");
                fetchIntros();
            }
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <Card className="rounded-[32px] border-none bg-white p-12 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" />
            </Card>
        );
    }

    const itemsToShow = data.asConnector.length > 0 ? data.asConnector : data.requested;
    if (itemsToShow.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <Zap size={12} className="text-indigo-600 fill-indigo-600" /> 
                    {data.asConnector.length > 0 ? "Requests Awaiting Your Intro" : "Your Warm Intro Requests"}
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {itemsToShow.map((intro, i) => (
                    <Card key={i} className="rounded-3xl border border-slate-50 bg-white hover:border-indigo-100 transition-all shadow-sm overflow-hidden group">
                        <CardContent className="p-6">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-slate-900">
                                                {data.asConnector.length > 0 ? intro.startupId?.startupName : intro.investorId?.investorName}
                                            </h4>
                                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400 h-5">
                                                {intro.status}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-400 max-w-sm line-clamp-1 italic">
                                            {intro.message}
                                        </p>
                                    </div>
                                </div>

                                {data.asConnector.length > 0 ? (
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-9 rounded-xl border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                            disabled={processingId === intro._id}
                                            onClick={() => handleRespond(intro._id, "CO_DECLINED")}
                                        >
                                            <X size={14} />
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="h-9 px-6 rounded-xl bg-indigo-600 hover:bg-zinc-950 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100"
                                            disabled={processingId === intro._id}
                                            onClick={() => handleRespond(intro._id, "CO_ACCEPTED")}
                                        >
                                            {processingId === intro._id ? <Loader2 size={12} className="animate-spin" /> : "Approve Intro"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 text-slate-300">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Connector</span>
                                            <span className="text-[11px] font-bold text-slate-900">{intro.connectorId?.name}</span>
                                        </div>
                                        <ArrowRight size={14} />
                                        <div className="flex flex-col">
                                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target</span>
                                             <span className="text-[11px] font-bold text-slate-900">{intro.investorId?.firmName || "Private"}</span>
                                        </div>
                                    </div>
                                )}
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
