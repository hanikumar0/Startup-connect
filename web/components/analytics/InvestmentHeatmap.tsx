"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart } from "lucide-react";

interface HeatmapData {
    industry: string;
    value: number;
    color: string;
    count: number;
}

export function InvestmentHeatmap({ data = [] }: { data?: HeatmapData[] }) {
    const hasData = data && data.length > 0;

    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-slate-900 h-full">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Portfolio Diversification</CardTitle>
                        <CardDescription>Visual breakdown of deals by industry sector.</CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 border-none font-bold">
                        Live Analytics
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center h-[240px] text-center space-y-3">
                        <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <PieChart className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">No investment data available yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex gap-2 h-[240px]">
                            {data.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: "100%" }}
                                    transition={{ delay: i * 0.1, duration: 1, ease: [0.23, 1, 0.32, 1] }}
                                    className="flex-1 flex flex-col gap-2 group"
                                    style={{ flex: item.value }}
                                >
                                    <div className={`relative flex-1 rounded-2xl ${item.color} opacity-90 group-hover:opacity-100 transition-all cursor-pointer shadow-lg shadow-indigo-100/20`}>
                                        <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                                            <span className="text-xl font-black">{item.value}%</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 truncate">{item.industry}</span>
                                        </div>
                                        <motion.div
                                            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-black"
                                            whileHover={{ scale: 1.2 }}
                                        >
                                            {item.count}
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">
                            {data.map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.industry}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
