"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Video, Globe, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string;
}

export default function ScheduleMeetingModal({ isOpen, onClose, entityName }: ScheduleMeetingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    setStep(2);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 blur-3xl bg-primary h-48 w-48 rounded-full" />
            <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-bold">Schedule Meeting</DialogTitle>
                <DialogDescription className="text-slate-400 font-medium">
                    Set up a strategy session with {entityName}.
                </DialogDescription>
            </DialogHeader>
        </div>

        <div className="p-8 bg-white">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</Label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <Input type="date" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-100" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <Input type="time" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-100" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Duration</Label>
                                <Select defaultValue="30">
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-100">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>
                                        <SelectItem value="45">45 minutes</SelectItem>
                                        <SelectItem value="60">60 minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Platform</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["Google Meet", "Zoom", "Internal"].map((p) => (
                                        <button 
                                            key={p}
                                            className="px-3 py-2 rounded-xl border border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:border-primary hover:text-primary transition-all bg-slate-50"
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={handleSchedule}
                            disabled={loading}
                            className="w-full h-12 bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 rounded-xl"
                        >
                            {loading ? "Scheduling..." : "Send Calendar Invite"}
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center space-y-6 py-6"
                    >
                        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-100">
                            <Check size={40} strokeWidth={3} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900">Invite Sent!</h3>
                            <p className="text-slate-500 font-medium max-w-xs mx-auto">
                                The calendar invite has been sent to {entityName}. You'll be notified once they accept.
                            </p>
                        </div>
                        <Button 
                            onClick={onClose}
                            className="w-full h-12 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl"
                        >
                            Got it
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
