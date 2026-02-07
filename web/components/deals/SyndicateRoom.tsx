"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
    Users,
    ShieldCheck,
    Clock,
    MessageSquare,
    TrendingUp,
    PieChart,
    Lock,
    Plus,
    ArrowUpRight,
    Handshake,
    DollarSign,
    CheckCircle2,
    FileText,
    Share2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommitmentFlow } from "./CommitmentFlow"

export function SyndicateRoom() {
    const [contribution, setContribution] = useState(50000)
    const [isCommitModalOpen, setIsCommitModalOpen] = useState(false)

    return (
        <div className="space-y-8">
            <CommitmentFlow
                isOpen={isCommitModalOpen}
                onClose={() => setIsCommitModalOpen(false)}
                syndicateName="SolarFlare AI"
                contributionAmount={contribution}
            />
            {/* Deal Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-2xl font-black shadow-2xl">
                        SF
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white">SolarFlare AI</h2>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none">Active Syndicate</Badge>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Lead by **Global Ventures** • Seed Round Extension</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 dark:border-slate-800">
                        <Share2 size={16} />
                        Invite LP
                    </Button>
                    <Button
                        onClick={() => setIsCommitModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
                    >
                        <Handshake size={16} />
                        Commit Capital
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Syndicate Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Fund Progress */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Total Commitment</CardTitle>
                                <span className="text-xs font-bold text-indigo-600">8 days left</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2 mb-4">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white">$1,450,000</h3>
                                <span className="text-slate-500 font-bold">/ $2,000,000</span>
                            </div>
                            <Progress value={72.5} className="h-3 mb-4" />
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500">72.5% Raised</span>
                                <span className="text-slate-900 dark:text-white">24 Investors Joined</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Interactive Cap Table Simulation for Co-Investors */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                            <CardTitle className="text-lg">Syndicate Cap Table Simulation</CardTitle>
                            <CardDescription>See your ownership stake based on your contribution.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="p-8 border-r border-slate-50 dark:border-slate-800">
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between mb-4">
                                                <label className="text-sm font-bold text-slate-900 dark:text-white">Your Contribution</label>
                                                <span className="text-indigo-600 font-bold">${contribution.toLocaleString()}</span>
                                            </div>
                                            <input
                                                type="range"
                                                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                min="10000"
                                                max="500000"
                                                step="5000"
                                                value={contribution}
                                                onChange={(e) => setContribution(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Post-Money Stake</span>
                                                <span className="text-lg font-black text-indigo-900 dark:text-white">0.42%</span>
                                            </div>
                                            <p className="text-[10px] text-indigo-700/60 dark:text-indigo-400/60 font-medium">Based on $12M Pre-money valuation.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-8 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center">
                                    <div className="relative h-40 w-40 mb-4">
                                        {/* Simple Visual Pie Simulation */}
                                        <svg viewBox="0 0 32 32" className="h-full w-full rotate-[-90deg]">
                                            <circle r="16" cx="16" cy="16" fill="transparent" stroke="currentColor" strokeWidth="32" strokeDasharray="100 100" className="text-slate-200 dark:text-slate-700" />
                                            <circle r="16" cx="16" cy="16" fill="transparent" stroke="currentColor" strokeWidth="32" strokeDasharray="30 100" className="text-indigo-600" />
                                            <circle r="16" cx="16" cy="16" fill="transparent" stroke="currentColor" strokeWidth="32" strokeDasharray="5 100" strokeDashoffset="-30" className="text-purple-500" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-20 w-20 rounded-full bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center">
                                                <PieChart className="text-indigo-600" size={24} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                                            Syndicate
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                                            Lead
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Syndicate Updates / Activity Feed */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="border-b border-slate-50 dark:border-slate-800">
                            <CardTitle className="text-lg">Deal Room Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50 dark:divide-slate-800">
                                {[
                                    { user: "Global Ventures", action: "Uploaded Due Diligence Memo", time: "2h ago", icon: FileText, type: "doc" },
                                    { user: "Sarah Chen", action: "Committed $250k to the round", time: "5h ago", icon: DollarSign, type: "money" },
                                    { user: "Lead Investor", action: "Hosted a Q&A session for LPs", time: "Yesterday", icon: MessageSquare, type: "event" },
                                ].map((activity, i) => (
                                    <div key={i} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            <activity.icon size={18} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{activity.user}</p>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{activity.time}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.action}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <ArrowUpRight size={14} className="text-slate-400" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar: Investor List & Legal Status */}
                <div className="space-y-8">
                    {/* Closing Checklist (Smart Escrow Flow) */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Road to Closing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: "Term Sheet Executed", status: "done" },
                                { label: "LPA Review & Sign", status: "done" },
                                { label: "LP Capital Calls", status: "active" },
                                { label: "KYC/AML Validation", status: "pending" },
                                { label: "Round Closing", status: "pending" },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${step.status === 'done' ? 'bg-emerald-100 text-emerald-600' :
                                        step.status === 'active' ? 'bg-indigo-100 text-indigo-600 animate-pulse' :
                                            'bg-slate-100 text-slate-300'
                                        }`}>
                                        {step.status === 'done' ? <CheckCircle2 size={12} /> : <div className="h-1.5 w-1.5 rounded-full bg-current" />}
                                    </div>
                                    <span className={`text-xs font-bold ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'
                                        }`}>{step.label}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Syndicate Members */}
                    <Card className="border-none shadow-sm dark:bg-slate-900 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Backers (24)</CardTitle>
                            <Users size={16} className="text-slate-400" />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="px-6 pb-6 space-y-4">
                                {[
                                    { name: "Global Ventures", role: "Lead", initial: "GV" },
                                    { name: "Alpha Partners", role: "Co-Investor", initial: "AP" },
                                    { name: "Elena Rodriguez", role: "LP", initial: "ER" },
                                    { name: "Vertex Capital", role: "LP", initial: "VC" },
                                ].map((member, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                                            <AvatarFallback className="bg-slate-100 text-indigo-600 text-[10px]">{member.initial}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-slate-900 dark:text-white">{member.name}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase">{member.role}</p>
                                        </div>
                                        {member.role === 'Lead' && <ShieldCheck size={14} className="text-indigo-600" />}
                                    </div>
                                ))}
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-700 h-auto p-2">
                                    + 20 others
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* AI Deal Logic Callout */}
                    <Card className="border-none shadow-sm bg-indigo-600 dark:bg-indigo-950 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <TrendingUp size={80} />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <h4 className="font-bold text-lg mb-2">Lead Insights</h4>
                            <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                                This deal round has **high velocity**. 40% of the target was raised in the first 48 hours.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-200">
                                <Clock size={12} />
                                Limited Allocation Remaining
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
