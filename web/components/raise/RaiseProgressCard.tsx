"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
    TrendingUp, 
    Calendar, 
    ArrowUpRight, 
    Target,
    Users,
    Activity,
    DollarSign,
    CheckCircle2,
    ShieldCheck,
    Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RaiseProgressCardProps {
    round: any;
    pipeline?: any;
    compact?: boolean;
}

export default function RaiseProgressCard({ round, pipeline, compact = false }: RaiseProgressCardProps) {
    if (!round) return null;

    const totalCommitted = (round.softCommittedAmount || 0) + (round.hardCommittedAmount || 0);
    const progress = Math.min(100, (totalCommitted / round.targetAmount) * 100);
    const remaining = Math.max(0, round.targetAmount - totalCommitted);

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amt);
    };

    return (
        <Card className={cn(
            "rounded-[40px] border-none shadow-2xl relative overflow-hidden group",
            compact ? "bg-white" : "bg-zinc-950 text-white"
        )}>
            {!compact && (
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Target size={240} strokeWidth={1} />
                </div>
            )}
            
            <CardContent className={cn("relative z-10", compact ? "p-6" : "p-10 space-y-8")}>
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <div className={cn(
                                "h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg",
                                compact ? "bg-zinc-950 text-white" : "bg-white text-zinc-900"
                             )}>
                                <TrendingUp size={20} />
                            </div>
                            <h3 className={cn("text-xl font-black uppercase tracking-tighter italic", compact ? "text-zinc-900" : "text-white")}>
                                {round.roundType.replace('-', ' ')} Round
                            </h3>
                        </div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", compact ? "text-zinc-400" : "text-zinc-500")}>
                            Target: {formatCurrency(round.targetAmount)}
                        </p>
                    </div>
                    <Badge className={cn(
                        "h-6 px-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        progress >= 50 ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    )}>
                        {Math.round(progress)}% Funded
                    </Badge>
                </div>

                {/* Progress Bar Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end mb-1">
                        <div>
                            <p className={cn("text-4xl font-black tracking-tighter italic leading-none", compact ? "text-zinc-900" : "text-white")}>
                                {formatCurrency(totalCommitted)}
                            </p>
                            <p className={cn("text-[10px] font-black uppercase tracking-widest mt-2", compact ? "text-zinc-500" : "text-zinc-400")}>
                                Committed Capital
                            </p>
                        </div>
                        <div className="text-right">
                            <p className={cn("text-xl font-black tracking-tighter opacity-80", compact ? "text-zinc-500" : "text-zinc-400")}>
                                {formatCurrency(remaining)}
                            </p>
                            <p className={cn("text-[9px] font-black uppercase tracking-widest", compact ? "text-zinc-300" : "text-zinc-500")}>
                                Remaining
                            </p>
                        </div>
                    </div>
                    <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 relative">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 relative"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                        </motion.div>
                    </div>
                    <div className="flex gap-4">
                         <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-indigo-500" />
                             <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Hard: {formatCurrency(round.hardCommittedAmount)}</span>
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-purple-400" />
                             <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Soft: {formatCurrency(round.softCommittedAmount)}</span>
                         </div>
                    </div>
                </div>

                {/* Pipeline Auto-Sync Widget */}
                {pipeline && !compact && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                        {[
                            { label: "Contacted", value: pipeline.totalContacted, icon: Users },
                            { label: "Responses", value: pipeline.responses, icon: MessageSquare },
                            { label: "Meetings", value: pipeline.meetings, icon: Calendar },
                            { label: "Due Diligence", value: pipeline.dueDiligence, icon: ShieldCheck }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-1">
                                <p className="text-[8px] font-black uppercase tracking-[2px] opacity-40">{stat.label}</p>
                                <div className="flex items-center gap-2">
                                    <stat.icon size={12} className="text-indigo-400" />
                                    <span className="text-sm font-black tracking-tighter">{stat.value}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

const MessageSquare = ({ size, className }: any) => <Activity size={size} className={className} />;
