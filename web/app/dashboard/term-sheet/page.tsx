"use client";

import { useState, useMemo } from "react";
import {
    FileText,
    Calculator,
    ChevronRight,
    ArrowUpRight,
    PieChart as PieChartIcon,
    Gavel,
    CheckCircle2,
    Shield,
    TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

export default function TermSheetBuilder() {
    const [deals, setDeals] = useState<any[]>([]);
    const [selectedDealId, setSelectedDealId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);

    const [valuation, setValuation] = useState(5000000);
    const [investment, setInvestment] = useState(500000);
    const [exitValuation, setExitValuation] = useState(50000000);
    const [participationType, setParticipationType] = useState("NON_PARTICIPATING");
    const [capAmount, setCapAmount] = useState(3);
    const [optionPool, setOptionPool] = useState(10);
    const [futureDilution, setFutureDilution] = useState(0);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [profileRes, dealsRes] = await Promise.all([
                    apiFetch("/api/users/profile"),
                    apiFetch("/api/deals")
                ]);

                const profileData = await profileRes.json();
                const dealsData = await dealsRes.json();

                if (dealsData.success && dealsData.deals.length > 0) {
                    setDeals(dealsData.deals);
                    const lastDeal = dealsData.deals[0];
                    setSelectedDealId(lastDeal._id);
                    setInvestment(lastDeal.amount || 500000);
                } else if (profileData.success && profileData.profile?.fundingRequired) {
                    setInvestment(profileData.profile.fundingRequired);
                }
            } catch (err) {
                console.error("Failed to load real data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const handleDealSelect = (dealId: string) => {
        const deal = deals.find(d => d._id === dealId);
        if (deal) {
            setSelectedDealId(dealId);
            setInvestment(deal.amount || 500000);
        }
    };

    const postMoney = useMemo(() => valuation + investment, [valuation, investment]);
    const investorOwnershipInitial = useMemo(() => (investment / postMoney) * 100, [investment, postMoney]);

    // Diluted counts
    const investorEquity = useMemo(() => investorOwnershipInitial * (1 - (futureDilution / 100)), [investorOwnershipInitial, futureDilution]);
    const founderEquity = useMemo(() => (100 - investorOwnershipInitial - optionPool) * (1 - (futureDilution / 100)), [investorOwnershipInitial, optionPool, futureDilution]);
    const optionPoolEquity = useMemo(() => optionPool * (1 - (futureDilution / 100)), [optionPool, futureDilution]);

    // Exit Strategy Logic
    const { investorPayout, founderPayout, optionPoolPayout, moic } = useMemo(() => {
        let invPayout = 0;
        const prefAmount = investment;

        if (participationType === "NON_PARTICIPATING") {
            invPayout = Math.max(prefAmount, (investorEquity / 100) * exitValuation);
        } else if (participationType === "PARTICIPATING") {
            invPayout = prefAmount + (investorEquity / 100) * (exitValuation - prefAmount);
        } else if (participationType === "PARTICIPATING_CAPPED") {
            const withParticipation = prefAmount + (investorEquity / 100) * (exitValuation - prefAmount);
            invPayout = Math.min(withParticipation, investment * capAmount);
            invPayout = Math.max(invPayout, (investorEquity / 100) * exitValuation);
        }

        invPayout = Math.min(invPayout, exitValuation);
        const proceedsRemaining = Math.max(0, exitValuation - invPayout);

        // Founder and Option Pool pro-rata of remaining
        const den = (100 - investorEquity);
        const fdrPayout = proceedsRemaining * (founderEquity / den);
        const optPayout = proceedsRemaining * (optionPoolEquity / den);

        return {
            investorPayout: invPayout,
            founderPayout: fdrPayout,
            optionPoolPayout: optPayout,
            moic: invPayout / investment
        };
    }, [participationType, investorEquity, exitValuation, investment, capAmount, founderEquity, optionPoolEquity]);

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Calculator className="text-indigo-600" />
                        Interactive Deal Engine
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Structure deals and simulate liquidity events in real-time.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-11 rounded-xl dark:border-slate-800">Save Draft</Button>
                    <Button className="h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none">
                        Export Term Sheet <FileText className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="economics" className="w-full">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 mb-8">
                    <TabsTrigger value="economics">Deal Economics</TabsTrigger>
                    <TabsTrigger value="exit">Exit Simulator</TabsTrigger>
                </TabsList>

                <TabsContent value="economics">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Inputs Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm h-full dark:bg-slate-900">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-lg">Economics</CardTitle>
                                    {deals.length > 0 && (
                                        <select
                                            className="text-[10px] bg-slate-100 dark:bg-slate-800 border-none rounded-md px-2 py-1 font-bold outline-none cursor-pointer"
                                            value={selectedDealId}
                                            onChange={(e) => handleDealSelect(e.target.value)}
                                        >
                                            {deals.map((d: any) => (
                                                <option key={d._id} value={d._id}>
                                                    Deal: {d.investor?.name || "Active"}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase text-slate-400">Pre-Money Valuation ($)</Label>
                                        <Input
                                            type="number"
                                            value={valuation}
                                            onChange={(e) => setValuation(Number(e.target.value))}
                                            className="h-12 text-lg font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        />
                                        <Slider
                                            value={[valuation]}
                                            max={20000000}
                                            step={100000}
                                            onValueChange={(v) => setValuation(v[0])}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase text-slate-400">Investment Amount ($)</Label>
                                        <Input
                                            type="number"
                                            value={investment}
                                            onChange={(e) => setInvestment(Number(e.target.value))}
                                            className="h-12 text-lg font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        />
                                        <Slider
                                            value={[investment]}
                                            max={5000000}
                                            step={50000}
                                            onValueChange={(v) => setInvestment(v[0])}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase text-slate-400">Option Pool (%)</Label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                value={[optionPool]}
                                                max={30}
                                                step={1}
                                                onValueChange={(v) => setOptionPool(v[0])}
                                                className="flex-1"
                                            />
                                            <span className="text-sm font-bold w-8">{optionPool}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase text-slate-400">Future Dilution (%)</Label>
                                        <div className="flex items-center gap-4">
                                            <Slider
                                                value={[futureDilution]}
                                                max={50}
                                                step={1}
                                                onValueChange={(v) => setFutureDilution(v[0])}
                                                className="flex-1"
                                            />
                                            <span className="text-sm font-bold w-8">{futureDilution}%</span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase text-slate-400">Governance & Rights</h3>
                                            <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200">AI Suggested</Badge>
                                        </div>
                                        {[
                                            { label: "1x Non-Participating Preference", active: true, desc: "Standard for Seed rounds. Protects downside while aligning exit upside." },
                                            { label: "Board Seat: Lead Investor", active: true, desc: "Lead investor usually requests one board seat for oversight." },
                                            { label: "Pro-rata Protection", active: true, desc: "Allows investors to maintain their stake in future rounds." },
                                            { label: "Veto Rights (Protective Provisions)", active: false, desc: "Requires investor consent for major corporate changes." },
                                        ].map((clause, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 group cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                                                    <span className={`text-sm font-bold ${clause.active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{clause.label}</span>
                                                    <div className={`h-5 w-5 rounded-full ${clause.active ? 'bg-indigo-600 text-white' : 'border-2 border-slate-200'} flex items-center justify-center`}>
                                                        {clause.active && <CheckCircle2 size={12} />}
                                                    </div>
                                                </div>
                                                {clause.active && (
                                                    <p className="text-[11px] text-slate-500 px-2 leading-relaxed">{clause.desc}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm dark:bg-indigo-950/20 bg-indigo-50/50 border border-indigo-100/50">
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-2 text-indigo-600">
                                        <Shield size={16} />
                                        <span className="text-sm font-black uppercase">AI Advisor</span>
                                    </div>
                                    <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                                        "Analyzing structural terms. Comparing a {investorOwnershipInitial.toFixed(1)}% stake for ${investment.toLocaleString()} against current market trends. Ensure 'Most Favored Nation' clauses are reviewed if syndicate participation is expected."
                                    </p>
                                    <Button size="sm" className="w-full bg-indigo-600 text-white rounded-lg text-xs h-8">Apply Market Standard</Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Model Visualization */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Post-Money", value: `$${(postMoney / 1000000).toFixed(1)}M`, icon: TrendingUp },
                                    { label: "Investor Stake", value: `${investorOwnershipInitial.toFixed(1)}%`, icon: PieChartIcon },
                                    { label: "Fully Diluted Stake", value: `${investorEquity.toFixed(1)}%`, icon: FileText },
                                ].map((stat, i) => (
                                    <Card key={i} className="border-none shadow-sm dark:bg-slate-900">
                                        <CardContent className="p-6">
                                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{stat.label}</p>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h4>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative min-h-[400px]">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20" />
                                <CardHeader className="relative z-10 border-b border-white/10">
                                    <CardTitle>Cap Table Model</CardTitle>
                                </CardHeader>
                                <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center justify-around gap-12">
                                    <motion.div
                                        className="h-48 w-48 rounded-full bg-indigo-500/80 border-4 border-indigo-400 flex flex-col items-center justify-center text-center shadow-2xl shadow-indigo-500/20"
                                        animate={{ scale: (founderEquity / 100) + 0.5 }}
                                    >
                                        <span className="text-sm font-bold uppercase tracking-widest text-indigo-100">Founders</span>
                                        <span className="text-4xl font-black">{founderEquity.toFixed(1)}%</span>
                                    </motion.div>

                                    <div className="flex flex-col gap-4 text-white/40 font-black text-[10px] uppercase tracking-tighter">
                                        <ChevronRight size={24} />
                                        <span>Diluted</span>
                                    </div>

                                    <motion.div
                                        className="h-48 w-48 rounded-full bg-emerald-500/80 border-4 border-emerald-400 flex flex-col items-center justify-center text-center shadow-2xl shadow-emerald-500/20"
                                        animate={{ scale: (investorEquity / 100) + 0.5 }}
                                    >
                                        <span className="text-sm font-bold uppercase tracking-widest text-emerald-100">Investors</span>
                                        <span className="text-4xl font-black">{investorEquity.toFixed(1)}%</span>
                                    </motion.div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm dark:bg-slate-900">
                                <CardContent className="p-6">
                                    <div className="flex gap-6 items-start p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                                        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                                            <Shield />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">Market Benchmarking</h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                                                This offer is being analyzed against recent Seed deals.
                                                A {investorOwnershipInitial.toFixed(1)}% stake is being evaluated within the standard 10-25% venture range for initial rounds.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="exit">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="border-none shadow-sm dark:bg-slate-900">
                                <CardHeader>
                                    <CardTitle>Exit Scenarios</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase text-slate-400">Liquidation Preference</Label>
                                        <div className="grid gap-2">
                                            {[
                                                { id: "NON_PARTICIPATING", label: "Non-Participating" },
                                                { id: "PARTICIPATING", label: "Participating" },
                                                { id: "PARTICIPATING_CAPPED", label: "Participating (Capped)" },
                                            ].map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setParticipationType(type.id)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${participationType === type.id
                                                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                                                        : "border-slate-100 dark:border-slate-800 text-slate-500"
                                                        } text-xs font-bold uppercase tracking-wider`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {participationType === "PARTICIPATING_CAPPED" && (
                                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                            <Label className="text-xs font-black uppercase text-slate-400">Participation Cap ({capAmount}x)</Label>
                                            <Slider
                                                value={[capAmount]}
                                                max={10}
                                                min={1}
                                                step={0.5}
                                                onValueChange={(v) => setCapAmount(v[0])}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase text-slate-400">Exit Valuation ($)</Label>
                                        <Input
                                            type="number"
                                            value={exitValuation}
                                            onChange={(e) => setExitValuation(Number(e.target.value))}
                                            className="h-12 text-lg font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-xl"
                                        />
                                        <Slider
                                            value={[exitValuation]}
                                            max={500000000}
                                            step={1000000}
                                            onValueChange={(v) => setExitValuation(v[0])}
                                        />
                                    </div>

                                    <div className="p-6 rounded-2xl bg-slate-900 text-white">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Investment Multiple</p>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-4xl font-black">{moic.toFixed(1)}x</h3>
                                            <Badge className="bg-emerald-500 text-white border-none">MOIC</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-none shadow-sm dark:bg-slate-900 p-8 border-l-4 border-l-indigo-600">
                                    <CardContent className="p-0">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Founder Payout</p>
                                        <h4 className="text-4xl font-black text-slate-900 dark:text-white">${(founderPayout / 1000000).toFixed(1)}M</h4>
                                    </CardContent>
                                </Card>

                                <Card className="border-none shadow-sm dark:bg-slate-900 p-8 border-l-4 border-l-emerald-600">
                                    <CardContent className="p-0">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Investor Payout</p>
                                        <h4 className="text-4xl font-black text-slate-900 dark:text-white">${(investorPayout / 1000000).toFixed(1)}M</h4>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-none shadow-sm dark:bg-slate-900">
                                <CardContent className="p-8">
                                    <h4 className="font-bold mb-4">Payout Analysis</h4>
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-500">Liquidation Preference</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">${(investment / 1000).toLocaleString()}k (1.0x Fixed)</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="h-8 w-full rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-500"
                                                    style={{ width: `${(investorPayout / exitValuation) * 100}%` }}
                                                />
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-500"
                                                    style={{ width: `${(founderPayout / exitValuation) * 100}%` }}
                                                />
                                                <div
                                                    className="h-full bg-slate-400 transition-all duration-500"
                                                    style={{ width: `${(optionPoolPayout / exitValuation) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest pt-2">
                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Investors: ${(investorPayout / 1000000).toFixed(1)}M
                                                </div>
                                                <div className="flex items-center gap-1.5 text-indigo-600">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                    Founders: ${(founderPayout / 1000000).toFixed(1)}M
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                                                    Option Pool: ${(optionPoolPayout / 1000000).toFixed(1)}M
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
