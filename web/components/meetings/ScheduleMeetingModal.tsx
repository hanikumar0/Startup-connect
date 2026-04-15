"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Video, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Globe, 
  Link as LinkIcon,
  Plus,
  Trash2,
  ChevronDown,
  Zap,
  Calendar,
  ArrowRight,
  Info
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExternalInviteProtocol } from "./ExternalInviteProtocol";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ScheduleMeetingModal({ isOpen, onClose, onRefresh }: ScheduleModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    duration: 30,
    agenda: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    providerType: "internal",
    meetingLink: "", // For custom links
    participants: [] as { userId?: string, email: string, name?: string }[]
  });

  const [step, setStep] = useState<"selection" | "form">("selection");
  const [meetingType, setMeetingType] = useState<"instant" | "scheduled" | null>(null);
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [connections, setConnections] = useState<any[]>([]);

  const fetchConnections = async () => {
    try {
        const res = await apiFetchJSON("/api/connections");
        if (res.success) {
            console.log(`[NETWORK] Successfully fetched ${res.connections?.length} connections`);
            setConnections(res.connections.filter((c: any) => c.status === "ACCEPTED"));
        }
    } catch (e) {
        console.error("[NETWORK] Interface anomaly in connection retrieval:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
        fetchConnections();
        setStep("selection");
        setMeetingType(null);
        setFormData({
            title: "",
            description: "",
            startTime: "",
            duration: 30,
            agenda: "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            providerType: "internal",
            meetingLink: "",
            participants: []
        });
    }
  }, [isOpen]);

  const handleAddParticipant = () => {
    if (newGuestEmail && !formData.participants.some(p => p.email === newGuestEmail)) {
      setFormData({
        ...formData,
        participants: [...formData.participants, { email: newGuestEmail }]
      });
      setNewGuestEmail("");
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p.email !== email)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title) {
        toast.error("Meeting title is required");
        return;
    }

    if (formData.participants.length === 0) {
        toast.error("At least one participant is required to initiate a session");
        return;
    }

    const isInstant = !formData.startTime;

    setLoading(true);
    try {
      const endpoint = isInstant ? "/api/meetings/instant" : "/api/meetings";
      
      // For instant meetings, we only need basic details
      const payload = isInstant 
        ? { 
            title: formData.title, 
            providerType: formData.providerType, 
            participants: formData.participants,
            agenda: formData.agenda,
            meetingLink: formData.meetingLink
          }
        : formData;

      const res = await apiFetchJSON(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (res.success) {
        if (isInstant) {
            toast.success("Instant protocol initiated. Connecting...");
            router.push(`/meetings/room/${res.meeting._id}`);
        } else {
            toast.success("Meeting registry updated. Invitations dispatched.");
            onRefresh();
            onClose();
        }
      } else {
        toast.error(res.message || "Strategic failure in meeting creation");
      }
    } catch (err) {
      toast.error("A system anomaly occurred during session initialization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] border-none shadow-2xl bg-white p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 italic mb-2">Institutional Access</Badge>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                Create Meeting
                <span className="text-white/40 not-italic font-medium ml-2">/ Meeting Setup</span>
              </DialogTitle>
            </div>
            <Button variant="ghost" size="icon" className="text-white/20 hover:text-white" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        {step === "selection" ? (
          <div className="p-12 space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter text-center">Connection Protocol</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Select your preferred synchronization method</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
                <button 
                    type="button"
                    onClick={() => {
                        setMeetingType("instant");
                        setStep("form");
                    }}
                    className="group relative flex flex-col p-8 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-emerald-500 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-1"
                >
                    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors mb-6">
                        <Zap size={24} className="fill-current" />
                    </div>
                    <Badge className="w-fit bg-emerald-100 text-emerald-600 border-none text-[8px] font-black uppercase tracking-widest px-2 italic mb-3">Priority Sync</Badge>
                    <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none">Instant</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-relaxed opacity-60">Initialize ad-hoc diligence node immediately</p>
                    <ArrowRight size={20} className="absolute bottom-8 right-8 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-2 transition-all" />
                </button>

                <button 
                    type="button"
                    onClick={() => {
                        setMeetingType("scheduled");
                        setStep("form");
                    }}
                    className="group relative flex flex-col p-8 bg-slate-50 rounded-3xl border-2 border-transparent hover:border-slate-900 transition-all duration-300 text-left hover:shadow-2xl hover:shadow-slate-100 hover:-translate-y-1"
                >
                    <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-slate-900 group-hover:text-white transition-colors mb-6">
                        <Calendar size={24} />
                    </div>
                    <Badge className="w-fit bg-slate-200 text-slate-600 border-none text-[8px] font-black uppercase tracking-widest px-2 italic mb-3">Registry Entry</Badge>
                    <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight leading-none">Schedule</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-relaxed opacity-60">Reserve strategic time slot in the registry</p>
                    <ArrowRight size={20} className="absolute bottom-8 right-8 text-slate-200 group-hover:text-slate-900 group-hover:translate-x-2 transition-all" />
                </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  Meeting Subject
                  <Badge variant="outline" className="text-[8px] opacity-40 italic">{meetingType?.toUpperCase()}</Badge>
                </label>
                <Input 
                  placeholder="E.G. PRODUCT STRATEGY SYNC..."
                  className="h-12 border-slate-100 bg-slate-50/30 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
                {meetingType === "scheduled" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time (UTC)</label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input 
                          type="datetime-local"
                          className="h-12 pl-10 border-slate-100 bg-slate-50/30 text-[11px] font-bold focus-visible:ring-slate-200"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          required={meetingType === "scheduled"}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                      <Select 
                        value={formData.duration.toString()} 
                        onValueChange={(v) => setFormData({...formData, duration: parseInt(v)})}
                      >
                        <SelectTrigger className="h-12 border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest italic focus:ring-slate-900 border-dashed">
                          <SelectValue placeholder="SET DURATION" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-100">
                          <SelectItem value="15" className="text-[10px] font-black uppercase tracking-widest italic">15 MIN</SelectItem>
                          <SelectItem value="30" className="text-[10px] font-black uppercase tracking-widest italic">30 MIN</SelectItem>
                          <SelectItem value="45" className="text-[10px] font-black uppercase tracking-widest italic">45 MIN</SelectItem>
                          <SelectItem value="60" className="text-[10px] font-black uppercase tracking-widest italic">60 MIN</SelectItem>
                          <SelectItem value="90" className="text-[10px] font-black uppercase tracking-widest italic">90 MIN</SelectItem>
                          <SelectItem value="120" className="text-[10px] font-black uppercase tracking-widest italic">120 MIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {meetingType && (
                  <div className={meetingType === "scheduled" ? "grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300" : "animate-in fade-in slide-in-from-top-2 duration-300"}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting Provider</label>
                      <Select 
                        value={formData.providerType} 
                        onValueChange={(v) => setFormData({...formData, providerType: v})}
                      >
                        <SelectTrigger className="h-12 border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest italic">
                          <SelectValue placeholder="SELECT PROVIDER" />
                        </SelectTrigger>
                        <SelectContent className="border-slate-100">
                        <SelectItem value="internal" className="text-[10px] font-black uppercase tracking-widest italic">Internal (Encrypted)</SelectItem>
                        <SelectItem value="google_meet" className="text-[10px] font-black uppercase tracking-widest italic">Google Meet</SelectItem>
                        <SelectItem value="zoom" className="text-[10px] font-black uppercase tracking-widest italic">Zoom Video</SelectItem>
                        <SelectItem value="microsoft_teams" className="text-[10px] font-black uppercase tracking-widest italic">Microsoft Teams</SelectItem>
                        <SelectItem value="custom" className="text-[10px] font-black uppercase tracking-widest italic">Custom URI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {meetingType === "scheduled" && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timezone</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <Input 
                            value={formData.timezone}
                            className="h-12 pl-10 border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest"
                            readOnly
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {formData.providerType === "custom" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Meeting URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      placeholder="HTTPS://MEET.EXTERNAL.COM/..." 
                      className="h-12 pl-10 border-slate-100 bg-slate-50/30 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({...formData, meetingLink: e.target.value})}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agenda / Notes</label>
                <Textarea 
                  placeholder="DESCRIBE THE CORE OBJECTIVES OF THIS MEETING..." 
                  className="min-h-[100px] border-slate-100 bg-slate-50/30 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200 resize-none"
                  value={formData.agenda}
                  onChange={(e) => setFormData({...formData, agenda: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select From Connections</label>
                <Select onValueChange={(val) => {
                    const userObj = connections.find(c => c.id === val || c._id === val);
                    if (userObj && !formData.participants.some(p => p.userId === userObj.id)) {
                        setFormData({
                            ...formData,
                            participants: [...formData.participants, { userId: userObj.id, email: userObj.email, name: userObj.name }]
                        });
                    }
                }}>
                  <SelectTrigger className="h-12 border-slate-100 bg-slate-50/30 text-[10px] font-black uppercase tracking-widest italic focus:ring-slate-900">
                    <SelectValue placeholder="BROWSE CONNECTIONS..." />
                  </SelectTrigger>
                  <SelectContent className="border-slate-100 max-h-[200px]">
                    {connections && connections.length > 0 ? (
                        connections.map((c: any) => (
                            <SelectItem key={c.id || c._id} value={c.id || c._id} className="text-[10px] font-black uppercase tracking-widest italic">
                                <div className="flex items-center gap-2">
                                    <span className="truncate">{c.name}</span>
                                    <Badge variant="outline" className="text-[7px] opacity-40 lowercase">{c.role || 'Partner'}</Badge>
                                </div>
                            </SelectItem>
                        ))
                    ) : (
                        <div className="p-6 text-center space-y-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                No active connections yet. <br/> Connect with users to start meetings.
                            </p>
                            <Button 
                                variant="outline" 
                                className="h-8 text-[7px] font-black uppercase px-4 border-slate-200"
                                onClick={() => router.push('/dashboard/discover')}
                            >
                                Discover Partners
                            </Button>
                        </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <ExternalInviteProtocol 
                    onAddParticipants={(newPs) => {
                      const existing = formData.participants.map(p => p.email);
                      const filtered = newPs.filter(p => !existing.includes(p.email));
                      setFormData({
                        ...formData,
                        participants: [...formData.participants, ...filtered]
                      });
                    }}
                    existingEmails={formData.participants.map(p => p.email)}
                  />
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                      <Info size={12} /> Manual Guest Input
                  </label>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      placeholder="GUEST EMAIL ADDRESS..." 
                      className="h-12 pl-10 border-slate-100 bg-slate-50/30 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200"
                      value={newGuestEmail}
                      onChange={(e) => setNewGuestEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddParticipant())}
                    />
                  </div>
                  <Button type="button" variant="outline" className="h-12 w-12 border-slate-200 group hover:border-slate-900 transition-colors" onClick={handleAddParticipant}>
                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                {formData.participants.map((p, i) => (
                  <Badge 
                    key={i} 
                    className="bg-white text-slate-900 border border-slate-200 py-1.5 pl-3 pr-1 text-[9px] font-black uppercase tracking-widest flex items-center gap-2 group hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all cursor-pointer shadow-sm"
                    onClick={() => handleRemoveParticipant(p.email)}
                  >
                    {p.name || p.email} <X size={12} className="opacity-40 group-hover:opacity-100" />
                  </Badge>
                ))}
                {formData.participants.length === 0 && <p className="text-[8px] font-black text-slate-300 uppercase italic py-2">System awaiting participant assignment...</p>}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 gap-3">
             <Button type="button" variant="ghost" className="text-[10px] font-black uppercase tracking-widest h-12 px-8" onClick={onClose}>
               Cancel
             </Button>
              <Button 
                type="submit" 
                className={`text-[10px] font-black uppercase tracking-widest px-10 h-12 italic shadow-xl transition-all ${meetingType === "instant" ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                disabled={loading}
              >
                {loading ? (
                     <div className="flex items-center gap-2">
                         <Clock className="animate-spin h-3 w-3" /> CREATING MEETING...
                     </div>
                ) : (
                     <div className="flex items-center gap-2">
                         {meetingType === "instant" ? 'Start Meeting Now' : 'Schedule Meeting'}
                        <ArrowRight size={14} />
                    </div>
               )}
             </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
