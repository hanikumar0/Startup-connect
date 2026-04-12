"use client";

import { useState, useMemo, useEffect } from "react";
import {
    FileText,
    Calculator,
    ChevronRight,
    ArrowUpRight,
    PieChart as PieChartIcon,
    Gavel,
    CheckCircle2,
    Shield,
    TrendingUp,
    IndianRupee,
    CircleDashed,
    ArrowRight,
    Zap,
    Lock,
    Scale
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
import { apiFetch } from "@/lib/api";

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
        const fdrPayout = den > 0 ? proceedsRemaining * (founderEquity / den) : 0;
        const optPayout = den > 0 ? proceedsRemaining * (optionPoolEquity / den) : 0;

        return {
            investorPayout: invPayout,
            founderPayout: fdrPayout,
            optionPoolPayout: optPayout,
            moic: investment > 0 ? invPayout / investment : 0
        };
    }, [participationType, investorEquity, exitValuation, investment, capAmount, founderEquity, optionPoolEquity]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <CircleDashed className="h-12 w-12 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase italic">Calibrating Deal Engine...</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 pb-20 px-1"
        >
            {/* Breadcrumb Console */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Strategic Modeling</span>
                <ChevronRight className="h-3 w-3 text-slate-300" />
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Institutional Deal Engine</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.8] mb-4">
                        DEAL<span className="text-indigo-600">.</span>ENGINE
                    </h1>
                    <p className="text-xl text-slate-500 font-medium italic max-w-xl">
                        High-fidelity term structuring & real-time liquidity simulation terminal.
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 font-black text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm transition-all">SAVE_DRAFT</Button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="h-14 px-8 bg-black hover:bg-slate-900 text-white rounded-2xl shadow-2xl shadow-indigo-100 gap-3 border-none ring-offset-4 transition-all font-black text-xs uppercase tracking-widest">
                            EXPORT TERM_SHEET <FileText size={16} strokeWidth={3} />
                        </Button>
                    </motion.div>
                </div>
            </div>

            <Tabs defaultValue="economics" className="w-full">
                <TabsList className="bg-slate-100/50 p-2 rounded-[24px] mb-10 h-16 w-full lg:w-fit gap-2">
                    <TabsTrigger value="economics" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">DEAL ECONOMICS</TabsTrigger>
                    <TabsTrigger value="exit" className="rounded-2xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm">EXIT_SIMULATOR</TabsTrigger>
                </TabsList>

                <TabsContent value="economics" className="focus-visible:outline-none">
                    <div className="space-y-10">
                        <Card className="rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all duration-700 bg-white overflow-hidden border border-slate-50">
                            <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8 bg-slate-50/30">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-[22px] bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-200">
                                        <TrendingUp className="h-8 w-8" strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">LIVE_PROTOCOL SYNC</p>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Institutional Lead Integration</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 w-full lg:w-auto">
                                    <select
                                        className="flex-1 lg:w-80 bg-white border border-slate-100 rounded-2xl px-6 h-14 font-black text-xs uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm appearance-none"
                                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")' }}
                                        value={selectedDealId}
                                        onChange={(e) => handleDealSelect(e.target.value)}
                                    >
                                        <option value="">MANUAL_MODE.EXE</option>
                                        {deals.map((d: any) => (
                                            <option key={d._id} value={d._id}>
                                                {d.investor?.name || d.investorProfile?.firmName} (₹{(d.amount / 100000).toFixed(0)}L)
                                            </option>
                                        ))}
                                    </select>
                                    {selectedDealId && (
                                        <Badge className="bg-emerald-500 text-white border-none h-14 px-6 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest animate-pulse shadow-lg shadow-emerald-100">
                                            <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                                            ACTIVE_SYNC
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Inputs Sidebar */}
                            <div className="lg:col-span-4 space-y-8">
                                <Card className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden border border-slate-50">
                                    <CardHeader className="p-10 pb-0">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Calculator className="text-indigo-600" size={18} strokeWidth={3} />
                                            <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase italic">Economic Control</span>
                                        </div>
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">OBJECT_PARAMS</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-10 space-y-10">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">PRE-MONEY VALUATION</Label>
                                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest italic opacity-70">REALTIME</span>
                                            </div>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" strokeWidth={3} />
                                                <Input
                                                    type="number"
                                                    value={valuation}
                                                    onChange={(e) => setValuation(Number(e.target.value))}
                                                    className="h-16 text-2xl font-black bg-slate-50/50 border-none rounded-2xl pl-10 tracking-tighter"
                                                />
                                            </div>
                                            <Slider
                                                value={[valuation]}
                                                max={20000000}
                                                step={100000}
                                                onValueChange={(v) => setValuation(v[0])}
                                                className="py-2"
                                            />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between px-1">
                                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">INVESTMENT_VOLUME</Label>
                                                {selectedDealId && <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest italic opacity-70">SYNCED</span>}
                                            </div>
                                            <div className="relative">
                                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" strokeWidth={3} />
                                                <Input
                                                    type="number"
                                                    value={investment}
                                                    onChange={(e) => setInvestment(Number(e.target.value))}
                                                    className="h-16 text-2xl font-black bg-slate-50/50 border-none rounded-2xl pl-10 tracking-tighter"
                                                />
                                            </div>
                                            <Slider
                                                value={[investment]}
                                                max={5000000}
                                                step={50000}
                                                onValueChange={(v) => setInvestment(v[0])}
                                                className="py-2"
                                            />
                                        </div>

                                        <div className="pt-8 border-t border-slate-50 space-y-8">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">GOVERNANCE & CLAUSES</h3>
                                                <Badge className="bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest rounded-full py-0 px-2">AI_RECOMMEND</Badge>
                                            </div>
                                            {[
                                                { label: "1x Non-Participating Preference", active: true, desc: "Standard for Seed rounds. Protects downside while aligning exit upside." },
                                                { label: "Board Seat: Lead Investor", active: true, desc: "Lead investor usually requests one board seat for oversight." },
                                                { label: "Pro-rata Protection", active: true, desc: "Allows investors to maintain their stake in future rounds." },
                                                { label: "Veto Rights (Protective Provisions)", active: false, desc: "Requires investor consent for major corporate changes." },
                                            ].map((clause, i) => (
                                                <div key={i} className="space-y-3">
                                                    <motion.div 
                                                        whileHover={{ scale: 1.01 }}
                                                        className={`flex items-center justify-between p-5 rounded-[24px] border transition-all cursor-pointer shadow-sm
                                                            ${clause.active ? 'bg-indigo-50/50 border-indigo-100 text-slate-900 shadow-indigo-100/20' : 'bg-slate-50/50 border-slate-100 text-slate-300 shadow-none'}
                                                        `}
                                                    >
                                                        <span className={`text-xs font-black uppercase italic tracking-tight`}>{clause.label}</span>
                                                        <div className={`h-6 w-6 rounded-full ${clause.active ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200'} flex items-center justify-center shadow-inner`}>
                                                            {clause.active ? <CheckCircle2 size={12} strokeWidth={3} /> : <Lock size={10} />}
                                                        </div>
                                                    </motion.div>
                                                    {clause.active && (
                                                        <p className="text-[11px] text-slate-500 px-2 font-medium italic leading-relaxed opacity-80">{clause.desc}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-[40px] border-none shadow-2xl shadow-indigo-100 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-800 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-10">
                                        <Zap size={80} strokeWidth={3} />
                                    </div>
                                    <CardContent className="p-10 relative z-10 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                <Shield className="h-6 w-6 text-white" strokeWidth={3} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest italic opacity-70">AI STRATEGIC ADVISOR</span>
                                        </div>
                                        <p className="text-sm font-medium italic leading-relaxed text-indigo-50">
                                            "Analyzing structural terms. Comparing a <span className="text-white font-black underline underline-offset-4 decoration-white/40">{investorOwnershipInitial.toFixed(1)}% stake</span> for <span className="text-white font-black">₹{(investment / 100000).toFixed(0)}L</span> against venture benchmarks. Ensure 'Most Favored Nation' clauses are reviewed if syndicate participation is expected."
                                        </p>
                                        <Button className="h-12 w-full bg-white hover:bg-indigo-50 text-indigo-900 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all">APPLY_MARKET_STANDARD</Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Model Visualization */}
                            <div className="lg:col-span-8 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[
                                        { label: "POST-MONEY VALVE", value: `₹${(postMoney / 10000000).toFixed(1)}Cr`, desc: "TOTAL_ENTERPRISE_VALUE" },
                                        { label: "INVESTOR_STAKE", value: `${investorOwnershipInitial.toFixed(1)}%`, desc: "INITIAL_OWNERSHIP" },
                                        { label: "FULLY_DILUTED", value: `${investorEquity.toFixed(1)}%`, desc: "PRO_FORMA_POSITION" },
                                    ].map((stat, i) => (
                                        <Card key={i} className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden border border-slate-50 hover:shadow-xl transition-all duration-500 group">
                                            <CardContent className="p-10">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4 group-hover:text-indigo-600 transition-colors">{stat.label}</p>
                                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-1 uppercase italic">{stat.value}</h4>
                                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60 italic">{stat.desc}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Card className="rounded-[56px] border-none shadow-2xl bg-black text-white overflow-hidden relative min-h-[500px] border border-white/5">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-black to-purple-950/40" />
                                    <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                                    
                                    <CardHeader className="relative z-10 p-12 pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <PieChartIcon className="text-indigo-400" size={18} strokeWidth={3} />
                                                    <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">Interactive Modeling</span>
                                                </div>
                                                <CardTitle className="text-4xl font-black tracking-tighter uppercase italic">CAP_TABLE.VISUALIZER</CardTitle>
                                            </div>
                                            <Badge className="bg-white/10 backdrop-blur-md border border-white/10 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-2xl">PRO_FORMA_STATE</Badge>
                                        </div>
                                    </CardHeader>
                                    
                                    <CardContent className="p-12 relative z-10 flex flex-col md:flex-row items-center justify-around gap-16 min-h-[350px]">
                                        <div className="relative group">
                                            <motion.div
                                                className="h-64 w-64 rounded-full bg-indigo-600/20 border-4 border-indigo-500/50 flex flex-col items-center justify-center text-center shadow-[0_0_80px_rgba(79,70,229,0.2)] backdrop-blur-sm relative overflow-hidden"
                                                animate={{ scale: (founderEquity / 100) + 0.6 }}
                                                transition={{ type: "spring", stiffness: 100 }}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 relative z-10 italic">Founders</span>
                                                <span className="text-6xl font-black relative z-10 tracking-tighter">{founderEquity.toFixed(1)}%</span>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-transparent" />
                                            </motion.div>
                                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-white/50 italic opacity-0 group-hover:opacity-100 transition-opacity">MAX_LIQUIDITY_VECTOR</div>
                                        </div>

                                        <div className="flex flex-col items-center gap-4 text-white/20">
                                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                            <Scale size={32} strokeWidth={1.5} className="rotate-90 md:rotate-0" />
                                            <div className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                            <span className="text-[9px] font-black uppercase tracking-tighter italic">Diluted_State</span>
                                        </div>

                                        <div className="relative group">
                                            <motion.div
                                                className="h-64 w-64 rounded-full bg-emerald-600/20 border-4 border-emerald-500/50 flex flex-col items-center justify-center text-center shadow-[0_0_80px_rgba(16,185,129,0.2)] backdrop-blur-sm relative overflow-hidden"
                                                animate={{ scale: (investorEquity / 100) + 0.6 }}
                                                transition={{ type: "spring", stiffness: 100 }}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 relative z-10 italic">Investors</span>
                                                <span className="text-6xl font-black relative z-10 tracking-tighter">{investorEquity.toFixed(1)}%</span>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/40 to-transparent" />
                                            </motion.div>
                                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-white/50 italic opacity-0 group-hover:opacity-100 transition-opacity">INSTITUTIONAL_CORE</div>
                                        </div>
                                    </CardContent>
                                    
                                    <div className="absolute bottom-8 left-12 flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">FOUNDER_POOL</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">INVESTOR_CORE</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 border border-white/20 rounded-full" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">OPTION_RESERVE</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="rounded-[48px] border-none shadow-sm bg-white overflow-hidden border border-slate-50">
                                    <CardContent className="p-10">
                                        <div className="flex flex-col md:flex-row gap-10 items-start p-10 rounded-[40px] bg-slate-50/50 border border-slate-100/50 shadow-inner group">
                                            <div className="h-20 w-20 rounded-[28px] bg-white flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-100/50 border border-indigo-50 group-hover:rotate-6 transition-transform duration-500 shrink-0">
                                                <Scale size={36} strokeWidth={2.5} />
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 italic leading-none">Venture Benchmarking</span>
                                                    <div className="h-px flex-1 bg-indigo-100" />
                                                </div>
                                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">MARKET_ALIGNMENT</h4>
                                                <p className="text-lg text-slate-500 font-medium italic leading-relaxed">
                                                    This object is being calibrated against current <span className="text-slate-900 font-black">Seed-Stage</span> venture signals. 
                                                    A <span className="text-indigo-600 font-black underline underline-offset-4 decoration-2">{investorOwnershipInitial.toFixed(1)}% position</span> is being evaluated within the standard 10-25% institutional range for initial capital injections.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="exit" className="focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        <div className="lg:col-span-4 space-y-8">
                            <Card className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden border border-slate-50">
                                <CardHeader className="p-10 pb-0">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Gavel className="text-indigo-600" size={18} strokeWidth={3} />
                                        <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase italic">Liquidity Control</span>
                                    </div>
                                    <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">EXIT_SCENARIOS</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-10">
                                    <div className="space-y-6">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic px-1">LIQUIDATION PREFERENCE</Label>
                                        <div className="grid gap-3">
                                            {[
                                                { id: "NON_PARTICIPATING", label: "Non-Participating" },
                                                { id: "PARTICIPATING", label: "Participating" },
                                                { id: "PARTICIPATING_CAPPED", label: "Participating (Capped)" },
                                            ].map((type) => (
                                                <motion.button
                                                    key={type.id}
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => setParticipationType(type.id)}
                                                    className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all flex items-center justify-between group
                                                        ${participationType === type.id
                                                            ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-lg shadow-indigo-100/50"
                                                            : "border-slate-50 bg-slate-50/30 text-slate-400 hover:border-slate-200 hover:bg-white shadow-sm"
                                                        }`}
                                                >
                                                    <span className="text-xs font-black uppercase tracking-wider italic">{type.label}</span>
                                                    {participationType === type.id && <CheckCircle2 size={16} strokeWidth={3} className="text-indigo-600 animate-in zoom-in-50" />}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {participationType === "PARTICIPATING_CAPPED" && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-6 overflow-hidden"
                                            >
                                                <div className="flex justify-between px-1">
                                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">PARTICIPATION CAP</Label>
                                                    <span className="text-sm font-black text-indigo-600 uppercase italic">{capAmount}x LEVEL</span>
                                                </div>
                                                <Slider
                                                    value={[capAmount]}
                                                    max={10}
                                                    min={1}
                                                    step={0.5}
                                                    onValueChange={(v) => setCapAmount(v[0])}
                                                    className="py-2"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="space-y-6">
                                        <div className="flex justify-between px-1">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">EXIT VALUATION</Label>
                                            <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest opacity-60">HYPOTHETICAL</span>
                                        </div>
                                        <div className="relative">
                                            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" strokeWidth={3} />
                                            <Input
                                                type="number"
                                                value={exitValuation}
                                                onChange={(e) => setExitValuation(Number(e.target.value))}
                                                className="h-16 text-2xl font-black bg-slate-50/50 border-none rounded-2xl pl-10 tracking-tighter"
                                            />
                                        </div>
                                        <Slider
                                            value={[exitValuation]}
                                            max={500000000}
                                            step={1000000}
                                            onValueChange={(v) => setExitValuation(v[0])}
                                            className="py-2"
                                        />
                                    </div>

                                    <div className="p-8 rounded-[32px] bg-black text-white shadow-2xl shadow-indigo-200 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <TrendingUp size={40} className="group-hover:translate-x-2 transition-transform" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-6 italic">INVESTMENT MULTIPLE</p>
                                        <div className="flex items-end justify-between relative z-10">
                                            <h3 className="text-6xl font-black tracking-tighter italic leading-none">{moic.toFixed(1)}x</h3>
                                            <Badge className="bg-indigo-600 text-white border-none font-black text-[10px] px-3 py-1 rounded-full shadow-lg shadow-indigo-500/20">MOIC_INDEX</Badge>
                                        </div>
                                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-4 italic opacity-0 group-hover:opacity-100 transition-opacity">PROTOCOL_OPTIMIZED_RETURN</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-8 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <motion.div whileHover={{ scale: 1.01 }}>
                                    <Card className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden border-l-8 border-l-indigo-600 border border-slate-50">
                                        <CardContent className="p-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">FOUNDER_PAYOUT</p>
                                                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Gavel size={16} strokeWidth={3} />
                                                </div>
                                            </div>
                                            <h4 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase italic">₹{(founderPayout / 10000000).toFixed(1)}Cr</h4>
                                            <p className="text-xs font-medium text-slate-500 italic opacity-80 uppercase tracking-tight">TOTAL_PROCEEDS_REALIZED</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.01 }}>
                                    <Card className="rounded-[40px] border-none shadow-sm bg-white overflow-hidden border-l-8 border-l-emerald-600 border border-slate-50">
                                        <CardContent className="p-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">INVESTOR_PAYOUT</p>
                                                <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                                    <CheckCircle2 size={16} strokeWidth={3} />
                                                </div>
                                            </div>
                                            <h4 className="text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase italic">₹{(investorPayout / 10000000).toFixed(1)}Cr</h4>
                                            <p className="text-xs font-medium text-slate-500 italic opacity-80 uppercase tracking-tight">CUMULATIVE_CAPITAL_RETURN</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>

                            <Card className="rounded-[56px] border-none shadow-sm bg-white overflow-hidden border border-slate-50 group">
                                <CardContent className="p-12">
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <ArrowUpRight className="text-indigo-600" size={20} strokeWidth={3} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 italic">Structural Analysis</span>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">PAYOUT_ORCHESTRATION</h3>
                                        </div>
                                        <div className="flex items-center gap-3 px-6 h-12 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-inner">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">LIQUIDATION PREF:</span>
                                            <span className="text-sm font-black text-slate-900 italic uppercase">1.0x FIXED</span>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="space-y-6">
                                            <div className="h-24 w-full rounded-[32px] bg-slate-50/50 border border-slate-100/50 overflow-hidden flex shadow-inner group-hover:scale-[1.01] transition-transform duration-700">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(investorPayout / exitValuation) * 100}%` }}
                                                    className="h-full bg-emerald-500 relative flex items-center justify-center group/inv hover:brightness-110 transition-all cursor-crosshair shadow-[inset_-2px_0_10px_rgba(0,0,0,0.1)]"
                                                >
                                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/inv:opacity-100 transition-opacity italic">INVESTORS</span>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(founderPayout / exitValuation) * 100}%` }}
                                                    className="h-full bg-indigo-600 relative flex items-center justify-center group/fdr hover:brightness-110 transition-all cursor-crosshair shadow-[inset_-2px_0_10px_rgba(0,0,0,0.1)]"
                                                >
                                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/fdr:opacity-100 transition-opacity italic">FOUNDERS</span>
                                                </motion.div>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(optionPoolPayout / exitValuation) * 100}%` }}
                                                    className="h-full bg-slate-200 relative flex items-center justify-center group/opt hover:brightness-110 transition-all cursor-crosshair"
                                                >
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] opacity-0 group-hover/opt:opacity-100 transition-opacity italic">OPTIONS</span>
                                                </motion.div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 px-2">
                                                <div className="space-y-3 p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100/50 hover:bg-emerald-50/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm" />
                                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Institutional Core</span>
                                                    </div>
                                                    <h5 className="text-2xl font-black text-emerald-900 tracking-tighter leading-none">₹{(investorPayout / 10000000).toFixed(2)}Cr</h5>
                                                    <p className="text-[9px] font-black text-emerald-600/50 uppercase tracking-widest opacity-80 italic">RETAINED_EQUITY_VALUE</p>
                                                </div>
                                                
                                                <div className="space-y-3 p-6 rounded-3xl bg-indigo-50/30 border border-indigo-100/50 hover:bg-indigo-50/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-indigo-600 shadow-sm" />
                                                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest italic">Founding Partners</span>
                                                    </div>
                                                    <h5 className="text-2xl font-black text-indigo-900 tracking-tighter leading-none">₹{(founderPayout / 10000000).toFixed(2)}Cr</h5>
                                                    <p className="text-[9px] font-black text-indigo-600/50 uppercase tracking-widest opacity-80 italic">FOUNDER_LIQUIDITY_CORE</p>
                                                </div>

                                                <div className="space-y-3 p-6 rounded-3xl bg-slate-50/50 border border-slate-100/50 hover:bg-slate-100/50 transition-colors">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="h-3 w-3 rounded-full bg-slate-400 shadow-sm" />
                                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Employee Reserve</span>
                                                    </div>
                                                    <h5 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">₹{(optionPoolPayout / 10000000).toFixed(2)}Cr</h5>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-80 italic">EQUITY_INCENTIVE_POOL</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 p-8 rounded-[32px] bg-slate-50/30 border border-slate-100 shadow-inner group">
                                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 shadow-sm border border-slate-50 shrink-0">
                                                <Scale size={24} strokeWidth={2.5} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic leading-none">Simulation Integrity</p>
                                                <p className="text-sm text-slate-500 font-medium italic leading-relaxed">
                                                    Liquidation cascade assumes a <span className="text-slate-900 font-black italic underline underline-offset-4 decoration-2 decoration-indigo-600/30">Standard Waterfall</span> mechanism. No secondary transactions or existing debt components are modeled in this simulation protocol.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
