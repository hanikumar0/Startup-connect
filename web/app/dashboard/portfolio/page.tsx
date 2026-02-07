"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp,
    DollarSign,
    Briefcase,
    PieChart,
    ArrowUpRight,
    Building2,
    Calendar,
    Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function PortfolioPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Investment Portfolio</h1>
                    <p className="text-slate-500">Track and manage your active investments and deal flow.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 gap-2">
                    <TrendingUp className="h-4 w-4" />
                    New Investment
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Committed", value: "$0.00", icon: DollarSign, color: "text-indigo-600" },
                    { label: "Active Companies", value: "0", icon: Building2, color: "text-emerald-600" },
                    { label: "Exit Multiplier", value: "0.0x", icon: Target, color: "text-blue-600" },
                    { label: "Deal Pipeline", value: "0", icon: PieChart, color: "text-purple-600" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <Badge variant="secondary" className="bg-slate-50 text-slate-400 font-bold text-[10px]">
                                    +0%
                                </Badge>
                            </div>
                            <h4 className="text-sm font-medium text-slate-500">{stat.label}</h4>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Portfolio Table Placeholder */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 py-6 px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Active Investments</CardTitle>
                            <CardDescription>You haven&apos;t added any investments yet.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-9 px-4 border-slate-200">
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">Your portfolio is empty</h3>
                        <p className="text-slate-500 max-w-sm mt-2">
                            Start discovering startups and connect with founders to begin your investment journey.
                        </p>
                        <Button variant="outline" className="mt-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold">
                            Go to Discover
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Meetings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-dashed border-slate-200">
                                <span className="text-sm text-slate-500">No meetings scheduled this week.</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Investment Updates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-dashed border-slate-200">
                                <span className="text-sm text-slate-500">No new updates from your portfolio.</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
