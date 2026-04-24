
"use client";

import { useState, useEffect } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { Users, Zap, Loader2, CheckCircle2, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface WarmIntroModalProps {
    isOpen: boolean;
    onClose: () => void;
    investor: any;
    startup: any;
}

export function WarmIntroModal({ isOpen, onClose, investor, startup }: WarmIntroModalProps) {
    const [paths, setPaths] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPath, setSelectedPath] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && investor?._id) {
            fetchPaths();
        }
    }, [isOpen, investor]);

    const fetchPaths = async () => {
        setLoading(true);
        try {
            const res = await apiFetchJSON(`/api/intros/available/${investor._id}`);
            if (res.success) {
                setPaths(res.data);
                if (res.data.length > 0) setSelectedPath(res.data[0]);
            }
        } catch (err) {
            console.error("Path fetch failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPath || !message) return;
        setSubmitting(true);
        try {
            const res = await apiFetchJSON("/api/intros/request", {
                method: "POST",
                body: JSON.stringify({
                    targetInvestorId: investor._id,
                    connectorId: selectedPath.connectorId,
                    message,
                    startupId: startup._id
                })
            });
            if (res.success) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 2000);
            }
        } catch (err) {
            console.error("Intro request fail", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none p-0 overflow-hidden bg-white shadow-2xl">
                {success ? (
                    <div className="p-12 text-center space-y-6 flex flex-col items-center">
                        <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={40} />
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Request Sent!</h3>
                             <p className="text-sm text-slate-500 font-medium">We've notified the connector. You'll hear back once they review it.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="p-10 pb-0">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                                <Badge variant="outline" className="text-indigo-600 border-indigo-100 bg-indigo-50/50 uppercase tracking-widest text-[9px] font-bold">Warm Intro Engine</Badge>
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                Intro to {investor?.investorName || investor?.name || "the Investor"}
                            </DialogTitle>
                            <DialogDescription className="text-[13px] font-medium text-slate-400">
                                Connect via trusted mutual networks to increase your chances by 10x.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-10 space-y-8">
                             {/* Path Selection */}
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select Introduction Path</span>
                                    {loading && <Loader2 size={12} className="animate-spin text-slate-300" />}
                                </div>
                                
                                {paths.length > 0 ? (
                                    <div className="space-y-3">
                                        {paths.map((path, i) => (
                                            <div 
                                                key={i} 
                                                onClick={() => setSelectedPath(path)}
                                                className={cn(
                                                    "p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between",
                                                    selectedPath?.connectorId === path.connectorId 
                                                        ? "border-indigo-600 bg-indigo-50/20" 
                                                        : "border-slate-100 bg-slate-50/30 hover:bg-slate-50"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "h-10 w-10 rounded-xl flex items-center justify-center",
                                                        selectedPath?.connectorId === path.connectorId ? "bg-indigo-600 text-white" : "bg-white text-slate-400 border border-slate-100"
                                                    )}>
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{path.name}</p>
                                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{path.type}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px]">{path.strength}%</Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : !loading && (
                                    <div className="p-8 rounded-2xl border-2 border-dashed border-slate-100 text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest italic">
                                        No warm intro paths found yet
                                    </div>
                                )}
                             </div>

                             {/* Message Field */}
                             <div className="space-y-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Purpose & Why Fit</span>
                                <Textarea 
                                    placeholder="Explain why you want to meet this investor and how they can help you..." 
                                    className="rounded-2xl border-slate-100 focus-visible:ring-indigo-600 h-24 placeholder:text-slate-300 text-sm font-medium"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                             </div>
                        </div>

                        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
                             <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400">Cancel</Button>
                             <Button 
                                disabled={!selectedPath || !message || submitting}
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-zinc-950 text-white rounded-xl px-10 h-12 font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all"
                             >
                                {submitting ? <Loader2 className="animate-spin mr-2 h-3 w-3" /> : <ChevronRight size={14} className="mr-2" />}
                                Request Introduction
                             </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
