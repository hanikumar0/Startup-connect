"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Target, 
    TrendingUp, 
    Calendar, 
    ArrowUpRight, 
    Users, 
    Activity,
    DollarSign,
    CheckCircle2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeletons";

interface CRMStatsWidgetProps {
    role: "startup" | "investor";
}

export default function CRMStatsWidget({ role }: CRMStatsWidgetProps) {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await apiFetch("/api/crm/analytics");
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error("Failed to fetch CRM stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>;
    }

    if (!stats) return null;

    const investorStats = [
        { label: "Total Leads", value: stats.totalLeads, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Deals in DD", value: stats.dealsInDD, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
        { label: "Meetings", value: stats.meetings, icon: Calendar, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Invested", value: stats.invested, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" }
    ];

    const startupStats = [
        { label: "Investors", value: stats.investorsContacted, icon: Target, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Replies", value: stats.repliesReceived, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Meetings", value: stats.meetingsBooked, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Committed", value: `₹${stats.committedAmount}L`, icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" }
    ];

    const activeStats = role === "investor" ? investorStats : startupStats;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activeStats.map((stat, idx) => (
                <Card key={idx} className="border-zinc-100 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                            <ArrowUpRight size={14} className="text-zinc-300" />
                        </div>
                        <p className="text-2xl font-black text-zinc-900 leading-tight">
                            {stat.value || 0}
                        </p>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
                            {stat.label}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
