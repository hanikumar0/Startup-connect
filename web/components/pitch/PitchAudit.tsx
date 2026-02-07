"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    CheckCircle2,
    AlertTriangle,
    BarChart3,
    Target,
    Users,
    Zap,
    Lightbulb,
    FileSearch,
    ShieldCheck,
    ArrowRight,
    Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AuditSection {
    title: string;
    icon: any;
    status: 'found' | 'weak' | 'missing';
    score: number;
    feedback: string;
}

const MOCK_SECTIONS: AuditSection[] = [
    {
        title: "Problem Statement",
        icon: Target,
        status: 'found',
        score: 95,
        feedback: "Crisp and relatable. The 'pain point' is well-articulated."
    },
    {
        title: "Solution & Product",
        icon: Zap,
        status: 'found',
        score: 88,
        feedback: "Clear value prop. Consider adding a short video demo link."
    },
    {
        title: "Market Opportunity",
        icon: BarChart3,
        status: 'weak',
        score: 45,
        feedback: "TAM/SAM/SOM numbers are missing specific data sources."
    },
    {
        title: "Team & Expertise",
        icon: Users,
        status: 'found',
        score: 92,
        feedback: "Strong background. Highlight the CTO's previous exit more."
    },
    {
        title: "Financial Projections",
        icon: ShieldCheck,
        status: 'missing',
        score: 0,
        feedback: "5-year roadmap missing. Investors will overlook this without it."
    },
]

export function PitchAudit() {
    const [isScanning, setIsScanning] = useState(true)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (isScanning) {
            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        setTimeout(() => setIsScanning(false), 500)
                        return 100
                    }
                    return prev + 2
                })
            }, 50)
            return () => clearInterval(timer)
        }
    }, [isScanning])

    return (
        <Card className="border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <CardTitle className="text-xl">AI Pitch Auditor</CardTitle>
                            <CardDescription>Real-time structural & narrative analysis</CardDescription>
                        </div>
                    </div>
                    {!isScanning && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-none px-3 py-1 font-bold">
                            Analysis Complete
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <AnimatePresence mode="wait">
                    {isScanning ? (
                        <motion.div
                            key="scanning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-12 flex flex-col items-center justify-center"
                        >
                            <div className="relative h-32 w-32 mb-8">
                                <motion.div
                                    className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileSearch className="h-12 w-12 text-indigo-600 animate-pulse" />
                                </div>
                                <svg className="h-32 w-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="60"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-indigo-600"
                                        style={{
                                            strokeDasharray: 377,
                                            strokeDashoffset: 377 - (377 * progress) / 100,
                                            transition: 'stroke-dashoffset 0.1s linear'
                                        }}
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Scanning Document Structure...</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center">
                                Our AI is identifying key business metrics and narrative logical flow.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Score Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1">Readiness Score</span>
                                    <span className="text-5xl font-black text-slate-900 dark:text-white">74<span className="text-lg text-slate-400">/100</span></span>
                                    <Badge className="mt-4 bg-indigo-600">Fundable B+</Badge>
                                </div>
                                <div className="md:col-span-3 space-y-4">
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-amber-900 dark:text-amber-400">Critical Gap Identified</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                                                You are missing a specific "Use of Funds" slide. Investors need to see how their capital will be deployed across R&D, Marketing, and Operations.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30">
                                        <Lightbulb className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-400">Strength Detected</p>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1">
                                                Your "Problem-Solution" fit is in the top 5% for your sector. The narrative transition is highly professional.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Sections */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Slide-by-Slide Audit</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {MOCK_SECTIONS.map((section, i) => (
                                        <div
                                            key={i}
                                            className="group p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${section.status === 'found' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' :
                                                            section.status === 'weak' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' :
                                                                'bg-red-50 dark:bg-red-900/20 text-red-600'
                                                        }`}>
                                                        <section.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                            {section.title}
                                                            {section.status === 'found' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                                        </p>
                                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{section.feedback}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-sm font-black ${section.score > 80 ? 'text-emerald-600' : section.score > 40 ? 'text-amber-600' : 'text-red-600'
                                                        }`}>
                                                        {section.score}%
                                                    </span>
                                                    <Progress value={section.score} className="h-1.5 w-24 mt-2" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <p className="text-xs text-slate-400 italic">Analysis powered by StartupConnect AI Model v2.4 (Beta)</p>
                                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                                    Generate AI Improvements
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
