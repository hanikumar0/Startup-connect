"use client";

import { useState } from "react";
import { 
  X, 
  AlertTriangle,
  Send,
  ShieldAlert,
  Frown,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAuthStore } from "@/lib/store";

interface CancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
  onRefresh: () => void;
}

export default function CancellationDialog({ isOpen, onClose, meeting, onRefresh }: CancellationDialogProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const isHost = meeting?.hostId?._id === user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
        toast.error("A mandatory reason is required for professional accountability");
        return;
    }

    setLoading(true);
    try {
      const endpoint = isHost 
        ? `/api/meetings/${meeting._id}/cancel` 
        : `/api/meetings/${meeting._id}/request-cancel`;

      const res = await apiFetchJSON(endpoint, {
        method: "POST",
        body: JSON.stringify({ reason })
      });

      if (res.success) {
        toast.success(isHost ? "Meeting terminated successfully" : "Cancellation request dispatched to host");
        onRefresh();
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Strategic failure during transmission");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-red-600 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 italic">Professional Protocol</Badge>
                <Badge className="bg-white text-red-600 border-none text-[8px] font-black uppercase tracking-widest px-2 italic">Termination Layer</Badge>
              </div>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-none mt-3">
                {isHost ? "Terminate Meeting" : "Request Cancellation"} <span className="text-red-200/40 not-italic font-medium">/ LOG</span>
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-red-50 shrink-0">
                    <ShieldAlert size={20} className="text-red-500" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-red-900">Integrity Warning</h4>
                    <p className="text-[9px] text-red-700 font-bold leading-relaxed italic">
                        {isHost 
                            ? "Terminating this session will notify all participants and impact your platform reliability score." 
                            : "Your request will be sent to the host for approval. Professional patterns are tracked."
                        }
                    </p>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    Mandatory Reason for Cancellation
                    <Activity size={12} className="text-slate-200" />
                </label>
                <Textarea 
                    placeholder="PROVIDE DETAILED JUSTIFICATION FOR THIS TERMINATION..." 
                    className="h-32 border-slate-100 bg-slate-50/30 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200 resize-none"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                />
            </div>

            <DialogFooter className="pt-4 gap-3">
                <Button type="button" variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-12 px-8" onClick={onClose}>
                    Abort
                </Button>
                <Button 
                    type="submit" 
                    className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-10 h-12 italic shadow-xl shadow-red-100 hover:bg-red-700"
                    disabled={loading}
                >
                    {loading ? "PROCESSING..." : isHost ? "Terminate session" : "Submit Request"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
