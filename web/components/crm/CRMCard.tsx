"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    MoreVertical, 
    MessageSquare, 
    Calendar, 
    FileText, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    TrendingUp,
    MapPin,
    DollarSign,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CRMCardProps {
    lead: any;
    role: "startup" | "investor";
    onMove?: (id: string, newStage: string) => void;
    onClick?: (lead: any) => void;
}

export default function CRMCard({ lead, role, onMove, onClick }: CRMCardProps) {
    const target = lead.targetId || {};
    const isInvestor = role === "investor";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            onClick={() => onClick?.(lead)}
            className="cursor-pointer group"
        >
            <Card className="border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                <CardContent className="p-3 space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {String(target.companyName || target.name || "U")[0]}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="text-xs font-black text-zinc-900 truncate uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                    {target.companyName || target.name || "Unknown"}
                                </h4>
                                <p className="text-[9px] text-zinc-400 font-bold truncate uppercase tracking-widest mt-0.5">
                                    {target.industry || target.investorType || (isInvestor ? "Early Stage" : "VC Firm")}
                                </p>
                            </div>
                        </div>
                        {lead.scoreSnapshot && (
                            <Badge className={cn(
                                "h-5 px-1.5 text-[8px] font-black border-none",
                                lead.scoreSnapshot >= 80 ? "bg-emerald-500 text-white" : 
                                lead.scoreSnapshot >= 60 ? "bg-indigo-500 text-white" : "bg-zinc-400 text-white"
                            )}>
                                {lead.scoreSnapshot}%
                            </Badge>
                        )}
                    </div>

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 py-1 border-y border-zinc-50">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            {isInvestor ? (
                                <TrendingUp size={10} className="text-indigo-500 flex-shrink-0" />
                            ) : (
                                <DollarSign size={10} className="text-indigo-500 flex-shrink-0" />
                            )}
                            <span className="text-[9px] font-black text-zinc-600 truncate uppercase mt-0.5">
                                {isInvestor ? (target.stage || "Seed") : (target.checkSize || "₹50L - ₹2Cr")}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                            <MapPin size={10} className="text-zinc-400 flex-shrink-0" />
                            <span className="text-[9px] font-black text-zinc-600 truncate uppercase mt-0.5">
                                {target.location || "Bengaluru"}
                            </span>
                        </div>
                    </div>

                    {/* Activity Indicators */}
                    <div className="flex items-center justify-between">
                        <div className="flex -space-x-1">
                            {lead.notes?.length > 0 && (
                                <div className="h-5 w-5 rounded-full bg-indigo-50 border border-white flex items-center justify-center text-indigo-600" title="Notes added">
                                    <FileText size={8} />
                                </div>
                            )}
                            {lead.tasks?.filter((t: any) => !t.completed).length > 0 && (
                                <div className="h-5 w-5 rounded-full bg-amber-50 border border-white flex items-center justify-center text-amber-600" title="Pending tasks">
                                    <Clock size={8} />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                            <Clock size={10} />
                            <span>{new Date(lead.lastActivityAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Quick Action (Visible on hover) */}
                    <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between gap-1 items-center">
                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-indigo-50 text-indigo-600">
                             <MessageSquare size={12} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 rounded-md hover:bg-zinc-100 text-zinc-400">
                             <MoreVertical size={12} />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
