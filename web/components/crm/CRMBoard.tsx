"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Plus, 
    Filter, 
    Search, 
    MoreHorizontal, 
    ChevronRight, 
    ChevronLeft,
    Loader2,
    LayoutGrid,
    LayoutList,
    TrendingUp,
    CheckCircle2,
    Calendar,
    MessageSquare,
    ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CRMCard from "./CRMCard";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CRMBoardProps {
    role: "startup" | "investor";
}

export default function CRMBoard({ role }: CRMBoardProps) {
    const [leads, setLeads] = useState<any[]>([]);
    const [stages, setStages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [view, setView] = useState<"kanban" | "list">("kanban");

    useEffect(() => {
        fetchPipeline();
    }, []);

    const fetchPipeline = async () => {
        try {
            const res = await apiFetch("/api/crm/pipeline");
            const data = await res.json();
            if (data.success) {
                setLeads(data.leads);
                setStages(data.stages);
            }
        } catch (error) {
            console.error("Failed to fetch pipeline:", error);
            toast.error("Failed to load pipeline data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMoveStage = async (leadId: string, newStage: string) => {
         try {
            // Optimistic update
            const oldLeads = [...leads];
            setLeads(leads.map(l => l._id === leadId ? { ...l, stage: newStage } : l));

            const res = await apiFetch("/api/crm/move-stage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ leadId, newStage })
            });
            const data = await res.json();
            if (!data.success) {
                setLeads(oldLeads);
                toast.error(data.message || "Failed to move stage");
            } else {
                toast.success(`Moved to ${stages.find(s => s.id === newStage)?.label}`);
            }
        } catch (error) {
            toast.error("Network error while moving stage");
        }
    };

    if (isLoading) {
        return (
            <div className="h-[600px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const filteredLeads = leads.filter(l => 
        (l.targetId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.targetId?.companyName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <Input 
                            placeholder="Search leads..." 
                            className="pl-10 h-10 rounded-xl border-zinc-100 bg-zinc-50 font-bold text-xs" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="h-10 w-10 rounded-xl p-0 border-zinc-100">
                        <Filter size={16} className="text-zinc-600" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-1 rounded-xl mr-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setView("kanban")}
                            className={cn("h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest", view === "kanban" ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500")}
                        >
                            <LayoutGrid size={14} className="mr-2" />
                            Board
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setView("list")}
                            className={cn("h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest", view === "list" ? "bg-white shadow-sm text-indigo-600" : "text-zinc-500")}
                        >
                            <LayoutList size={14} className="mr-2" />
                            List
                        </Button>
                    </div>
                    <Button className="h-10 bg-zinc-950 text-white rounded-xl font-black uppercase text-[10px] tracking-[2px] px-6">
                        <Plus size={16} className="mr-2" />
                        Add Lead
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex gap-4 pb-4 min-h-[600px]">
                    {stages.map((stage) => {
                        const stageLeads = filteredLeads.filter(l => l.stage === stage.id);
                        return (
                            <div key={stage.id} className="inline-block w-80 bg-zinc-50/50 rounded-2xl border border-zinc-100/50 p-3 h-full">
                                {/* Stage Header */}
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white border border-zinc-200 text-zinc-900 h-6 px-2 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                            {stage.label}
                                        </Badge>
                                        <span className="text-[10px] font-black text-zinc-400">{stageLeads.length}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-zinc-400">
                                        <MoreHorizontal size={14} />
                                    </Button>
                                </div>

                                {/* Leads */}
                                <div className="space-y-3">
                                    <AnimatePresence mode="popLayout">
                                        {stageLeads.map((lead) => (
                                            <CRMCard 
                                                key={lead._id} 
                                                lead={lead} 
                                                role={role} 
                                                onMove={handleMoveStage}
                                            />
                                        ))}
                                    </AnimatePresence>
                                    
                                    {stageLeads.length === 0 && (
                                        <div className="h-32 border-2 border-dashed border-zinc-200 rounded-xl flex items-center justify-center italic text-zinc-300 text-[10px] font-bold uppercase tracking-widest">
                                            No Leads
                                        </div>
                                    )}
                                </div>

                                {/* Column Footer */}
                                <Button 
                                    variant="ghost" 
                                    className="w-full mt-4 h-10 border border-dashed border-zinc-200 rounded-xl text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all text-[10px] font-black uppercase tracking-widest"
                                >
                                    <Plus size={14} className="mr-2" />
                                    {role === 'investor' ? 'Add Startup' : 'Add Investor'}
                                </Button>
                            </div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
