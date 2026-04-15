"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MessageCircle,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
  onRefresh: () => void;
}

export default function RescheduleDialog({ isOpen, onClose, meeting, onRefresh }: RescheduleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [fetchingAI, setFetchingAI] = useState(false);
  const [formData, setFormData] = useState({
    proposedStartTime: "",
    proposedDuration: 30,
    note: ""
  });

  const fetchAISuggestions = async () => {
    if (!meeting?._id) return;
    setFetchingAI(true);
    try {
      const res = await apiFetchJSON(`/api/meetings/${meeting._id}/ai-suggestions`);
      if (res.success) setSuggestions(res.suggestions);
    } catch (err) {
      console.error("AI Suggestions failed", err);
    } finally {
      setFetchingAI(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAISuggestions();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.proposedStartTime || !formData.proposedDuration) {
        toast.error("Please specify a valid start time and duration");
        return;
    }

    setLoading(true);
    try {
      const res = await apiFetchJSON(`/api/meetings/${meeting._id}/request-reschedule`, {
        method: "POST",
        body: JSON.stringify(formData)
      });

      if (res.success) {
        toast.success("Reschedule protocol initiated. Host notified.");
        onRefresh();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Anomaly during reschedule transmission");
    } finally {
      setLoading(false);
    }
  };

  const applyAISlot = (slot: any) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const diff = Math.round((end.getTime() - start.getTime()) / 60000);

    setFormData({
        ...formData,
        proposedStartTime: start.toISOString().slice(0, 16),
        proposedDuration: diff || 30
    });
    toast.success("AI Slot Synchronized");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] border-none shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 italic">Intelligence Protocol</Badge>
                <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 italic animate-pulse">Reschedule Required</Badge>
              </div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-none mt-3">
                Propose New Time <span className="text-white/40 not-italic font-medium">/ SYNC</span>
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
            {/* AI Suggestion Hub */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-500" /> AI AUTO-SUGGESTION
                    </h4>
                    {fetchingAI && <BrainCircuit size={14} className="animate-spin text-slate-300" />}
                </div>
                <div className="grid grid-cols-1 gap-3">
                    {suggestions.map((slot, i) => (
                        <div 
                            key={i} 
                            className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between group hover:border-amber-200 hover:bg-amber-50/30 transition-all cursor-pointer"
                            onClick={() => applyAISlot(slot)}
                        >
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-900 uppercase italic">
                                    {new Date(slot.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                                </p>
                                <p className="text-[11px] font-bold text-slate-500 tracking-widest">
                                    {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p className="text-[8px] font-black text-amber-600 uppercase tracking-tighter opacity-80">{slot.reason}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black">{slot.confidence}% Match</Badge>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 group-hover:text-amber-500">
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {suggestions.length === 0 && !fetchingAI && (
                        <p className="text-[9px] font-black text-slate-300 text-center uppercase py-4">Generating optimal time slots...</p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Start</label>
                        <Input 
                            type="datetime-local"
                            className="h-12 border-slate-100 bg-slate-50/30 text-[11px] font-bold"
                            value={formData.proposedStartTime}
                            onChange={(e) => setFormData({...formData, proposedStartTime: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Duration</label>
                        <select 
                            className="h-12 w-full border-slate-100 bg-slate-50/30 text-[11px] font-bold rounded-md px-3 outline-none focus-visible:ring-1 focus-visible:ring-slate-900 border-dashed italic uppercase"
                            value={formData.proposedDuration}
                            onChange={(e) => setFormData({...formData, proposedDuration: parseInt(e.target.value)})}
                            required
                        >
                            <option value="15">15 MIN</option>
                            <option value="30">30 MIN</option>
                            <option value="45">45 MIN</option>
                            <option value="60">60 MIN</option>
                            <option value="90">90 MIN</option>
                            <option value="120">120 MIN</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                        Brief Alignment Note
                        <span className="text-[8px] font-bold text-slate-300 uppercase">Optional</span>
                    </label>
                    <Textarea 
                        placeholder="SPECIFY REASON FOR SHIFT..." 
                        className="h-24 border-slate-100 bg-slate-50/30 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200 resize-none"
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                    />
                </div>

                <DialogFooter className="pt-4 gap-3">
                    <Button type="button" variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-12 px-8" onClick={onClose}>
                        Abort
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-10 h-12 italic shadow-xl shadow-slate-200 hover:bg-slate-800"
                        disabled={loading}
                    >
                        {loading ? "TRANSMITTING..." : "Propose Time Shift"}
                    </Button>
                </DialogFooter>
            </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
