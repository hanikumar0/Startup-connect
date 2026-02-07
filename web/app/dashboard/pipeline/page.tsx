"use client";

import { useEffect, useState } from "react";
import {
    Plus,
    MoreVertical,
    DollarSign,
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
    User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";

const STAGES = [
    { id: "PROSPECT", label: "Prospect", color: "bg-slate-100 text-slate-700" },
    { id: "CONTACTED", label: "Contacted", color: "bg-blue-50 text-blue-700" },
    { id: "DILIGENCE", label: "Due Diligence", color: "bg-indigo-50 text-indigo-700" },
    { id: "TERM_SHEET", label: "Term Sheet", color: "bg-purple-50 text-purple-700" },
    { id: "CLOSED", label: "Closed", color: "bg-emerald-50 text-emerald-700" }
];

export default function PipelinePage() {
    const [deals, setDeals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchDeals();
    }, []);

    const fetchDeals = async () => {
        try {
            const response = await apiFetch("/api/deals");
            const data = await response.json();
            if (data.success) {
                setDeals(data.deals);
            }
        } catch (error) {
            console.error("Error fetching deals:", error);
        } finally {
            setIsLoading(false);
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
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Investor Pipeline</h1>
                    <p className="text-slate-500 mt-1">Track your fundraising progress and manage investor leads.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pipeline Goal</p>
                        <p className="text-xl font-bold text-indigo-600">$5.0M</p>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2">
                        <Plus className="h-4 w-4" />
                        Add Lead
                    </Button>
                </div>
            </div>

            {/* Kanban Board Layout */}
            <div className="flex gap-6 overflow-x-auto pb-8 min-h-[70vh] -mx-4 px-4 sm:mx-0 sm:px-0">
                {STAGES.map((stage) => {
                    const stageDeals = deals.filter(d => d.stage === stage.id);
                    const totalAmount = stageDeals.reduce((sum, d) => sum + (d.amount || 0), 0);

                    return (
                        <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900">{stage.label}</h3>
                                    <Badge variant="secondary" className={`${stage.color} border-none font-bold text-[10px]`}>
                                        {stageDeals.length}
                                    </Badge>
                                </div>
                                <span className="text-xs font-bold text-slate-400">
                                    ${(totalAmount / 1000000).toFixed(1)}M
                                </span>
                            </div>

                            <ScrollArea className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-3">
                                <div className="space-y-3">
                                    {stageDeals.map((deal) => (
                                        <Card key={deal._id} className="border-none shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 group cursor-pointer bg-white">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 transition-colors">
                                                        <User className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                                                    </div>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                <h4 className="font-bold text-slate-900 line-clamp-1">{deal.investor?.name || deal.investorProfile?.firmName || "Unknown Investor"}</h4>
                                                <p className="text-xs text-slate-500 font-medium truncate uppercase tracking-tight mt-0.5">
                                                    {deal.investorProfile?.investorType || "Angel Investor"}
                                                </p>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                                    <div className="flex items-center gap-1.5">
                                                        <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                                                        <span className="text-sm font-bold text-slate-900">${(deal.amount / 1000).toFixed(0)}k</span>
                                                    </div>
                                                    {stage.id !== "CLOSED" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                            onClick={() => handleMoveStage(deal._id, deal.stage)}
                                                        >
                                                            <ChevronRight className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {stageDeals.length === 0 && (
                                        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl opacity-40">
                                            <Plus className="h-6 w-6 mx-auto mb-2 text-slate-400" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Drop Here</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
