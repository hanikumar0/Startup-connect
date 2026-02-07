"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    CheckCircle2,
    ShieldCheck,
    CreditCard,
    FileSignature,
    Lock,
    ArrowRight,
    Loader2,
    Sparkles,
    AlertCircle,
    Info
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface CommitmentFlowProps {
    isOpen: boolean;
    onClose: () => void;
    syndicateName: string;
    contributionAmount: number;
}

export function CommitmentFlow({ isOpen, onClose, syndicateName, contributionAmount }: CommitmentFlowProps) {
    const [step, setStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [signature, setSignature] = useState("")

    const handleNext = () => {
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
            setStep((prev) => prev + 1)
        }, 1500)
    }

    const resetFlow = () => {
        setStep(1)
        setSignature("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); resetFlow(); } }}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-none shadow-2xl p-0 overflow-hidden">
                {/* Header with Step Indicator */}
                <div className="bg-indigo-600 p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lock size={80} />
                    </div>
                    <div className="relative z-10">
                        <DialogTitle className="text-xl font-black">Capital Commitment</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-medium">
                            Securing your allocation in {syndicateName}
                        </DialogDescription>
                    </div>
                    <div className="mt-6 flex justify-between gap-1">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-white' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Investment Summary</h4>
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Capital Committing</span>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">${contributionAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Syndicate Fee (Carry)</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">20%</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Estimated Post-Money Stake</span>
                                            <span className="text-sm font-black text-indigo-600">0.42%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-800 dark:text-amber-400">
                                    <div className="mt-0.5"><Info size={16} /></div>
                                    <p className="text-[10px] font-medium leading-relaxed">
                                        Committing is a binding agreement to provide funds upon the capital call. Verification and KYC must be completed before final wire.
                                    </p>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl" onClick={handleNext}>
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Confirm & Review LPA"}
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <h4 className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">Legal Signature (LPA)</h4>
                                    <div className="h-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-4 overflow-y-auto text-[10px] leading-relaxed text-slate-600 dark:text-slate-400 font-mono">
                                        Limited Partnership Agreement (v2.4)
                                        <br /><br />
                                        This Agreement is entered into between Investor and Lead.
                                        By signing below, the Investor commits to the specified capital contribution...
                                        [SCROLL TO READ FULL TERMS]
                                        <br /><br />
                                        1. Capital Contribution: ${contributionAmount.toLocaleString()}
                                        <br />
                                        2. Management Fee: 0%
                                        <br />
                                        3. Performance Allocation: 20% Carry
                                        <br />
                                        4. Confidentiality: All details are strictly private...
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500">Type full legal name to sign</label>
                                        <Input
                                            placeholder="John Doe"
                                            className="h-12 border-slate-200 dark:bg-slate-800 rounded-xl italic font-serif text-lg"
                                            value={signature}
                                            onChange={(e) => setSignature(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl"
                                    disabled={!signature}
                                    onClick={handleNext}
                                >
                                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Authorize Commitment"}
                                </Button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-8 text-center space-y-6"
                            >
                                <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Commitment Received!</h3>
                                    <p className="text-sm text-slate-500 max-w-[280px] mx-auto">
                                        Your commitment of **${contributionAmount.toLocaleString()}** is now active in the deal room.
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center gap-3 text-left">
                                    <div className="h-10 w-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                                        <ShieldCheck className="text-indigo-600" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Next Step: Capital Call</p>
                                        <p className="text-[10px] text-slate-500">The lead will notify you when the round is ready to wire.</p>
                                    </div>
                                </div>
                                <Button className="w-full h-12 rounded-xl bg-slate-900 text-white" onClick={onClose}>
                                    Return to Deal Room
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}
