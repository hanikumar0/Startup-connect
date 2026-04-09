"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Timer, MessageCircle, Sparkles, MapPin, Map } from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";

interface MeetingFormProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "startup" | "investor";
}

export default function MeetingForm({ isOpen, onClose, targetId, targetType }: MeetingFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingDate: "",
    meetingTime: "",
    duration: 30,
    timezone: "UTC"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // 1. Get/Create conversation first for chat integration
        const convRes = await apiFetchJSON("/api/messages/conversation", {
            method: "POST",
            body: JSON.stringify({ participantId: targetId }) // Target user ID
        });

        if (!convRes.success) throw new Error("Chat initialization failed");

        // 2. Submit meeting request
        const res = await apiFetchJSON("/api/meetings/request", {
            method: "POST",
            body: JSON.stringify({
                ...formData,
                startupId: targetType === "startup" ? targetId : undefined, // This needs adjustment in backend to resolve model IDs
                investorId: targetType === "investor" ? targetId : undefined,
                conversationId: convRes.data._id
            })
        });

        if (res.success) {
            toast.success("Meeting request sent!");
            onClose();
        }
    } catch (err) {
        toast.error("Failed to request meeting");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-zinc-900 p-10 space-y-4">
             <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-sm border border-white/10">
                <Calendar className="h-6 w-6" />
             </div>
             <div>
                <DialogTitle className="text-3xl font-black text-white tracking-tighter">Schedule Sync</DialogTitle>
                <DialogDescription className="text-zinc-400 font-medium">Request a high-level strategic sync with our verified network partners.</DialogDescription>
             </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 bg-white space-y-8">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Meeting Objectives</Label>
                    <Input 
                        placeholder="Strategic Partnership Discussion" 
                        required 
                        className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 font-bold focus-visible:ring-4 focus-visible:ring-indigo-50/50 focus-visible:border-indigo-100 transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Proposed Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                            <Input 
                                type="date" 
                                required 
                                className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 pl-12 font-bold"
                                value={formData.meetingDate}
                                onChange={(e) => setFormData({...formData, meetingDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Time (UTC)</Label>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                            <Input 
                                type="time" 
                                required 
                                className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-100 pl-12 font-bold"
                                value={formData.meetingTime}
                                onChange={(e) => setFormData({...formData, meetingTime: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Context & Agenda (Optional)</Label>
                    <Textarea 
                        placeholder="Summary of the points we'd like to cover..." 
                        className="min-h-[120px] rounded-[1.5rem] bg-zinc-50/50 border-zinc-100 p-5 font-medium resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>
            </div>

            <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={onClose} className="h-14 px-8 rounded-2xl font-bold text-zinc-400 hover:text-zinc-900 transition-colors">CANCEL</Button>
                <Button type="submit" disabled={loading} className="h-14 px-10 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs tracking-widest shadow-xl shadow-zinc-200 transition-all">
                    {loading ? "PROPOSING..." : "SEND REQUEST"} <Sparkles className="ml-2 h-4 w-4" />
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
