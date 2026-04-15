"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Search, 
  ExternalLink,
  Shield,
  Zap,
  Loader2,
  Lock,
  Timer,
  ArrowRight,
  MoreVertical,
  XCircle,
  RefreshCw,
  Video as VideoIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ScheduleMeetingModal from "@/components/meetings/ScheduleMeetingModal";

export default function MeetingsPage() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [instantLoading, setInstantLoading] = useState(false);

    const fetchMeetings = async () => {
        setLoading(true);
        try {
            const data = await apiFetchJSON("/api/meetings");
            if (data.success) setMeetings(data.meetings || []);
        } catch (err) {
            console.error("Meetings fail", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const startInstantMeeting = async () => {
        setInstantLoading(true);
        try {
            const res = await apiFetchJSON("/api/meetings/instant", {
                method: "POST",
                body: JSON.stringify({
                    title: `INSTANT SESSION - ${user?.name?.toUpperCase()}`,
                    description: "Ad-hoc diligence session started by " + user?.name,
                    providerType: "internal",
                    participants: []
                })
            });

            if (res.success) {
                toast.success("Instant protocol initiated");
                router.push(`/meetings/room/${res.meeting._id}`);
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error("Failed to start instant session");
        } finally {
            setInstantLoading(false);
        }
    };

    const cancelMeeting = async (id: string) => {
        try {
            const res = await apiFetchJSON(`/api/meetings/${id}/cancel`, {
                method: "POST",
                body: JSON.stringify({ reason: "Manual cancellation by user" })
            });
            if (res.success) {
                toast.success("Meeting terminated");
                fetchMeetings();
            }
        } catch (err) {
            toast.error("Cancellation failed");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "scheduled": return <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 italic">Scheduled</Badge>;
            case "ongoing": return <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 animate-pulse italic">Active Node</Badge>;
            case "cancelled": return <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-widest px-2 opacity-50 italic">Terminated</Badge>;
            case "completed": return <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 opacity-50">Archive</Badge>;
            default: return <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-20">
                {/* Institutional Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronization</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Diligence <span className="text-slate-400 not-italic font-medium">/ Registry</span></h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button 
                            variant="outline" 
                            className="h-10 border-slate-200 text-[10px] font-black uppercase tracking-widest px-6 italic"
                            onClick={startInstantMeeting}
                            disabled={instantLoading}
                        >
                            {instantLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Zap size={16} className="mr-2 text-emerald-500 fill-emerald-500" />} 
                            Start Instant
                        </Button>
                        <Button 
                            className="h-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 italic shadow-lg shadow-slate-200"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Plus size={16} className="mr-2" /> Create Meeting
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Insights Hub */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                           <CardContent className="p-8">
                              <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 mb-4 italic">Platform Metrics</Badge>
                              <div className="space-y-6">
                                 <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Connectivity</p>
                                    <h3 className="text-3xl font-black italic mt-1 leading-none">{meetings.length} <span className="text-xs not-italic opacity-40 uppercase">Sessions</span></h3>
                                 </div>
                                 <div className="pt-6 border-t border-white/10">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-3">Sync Protocols</p>
                                    <div className="space-y-3">
                                       <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="opacity-60">P2P Encrypted</span>
                                          <span className="text-emerald-400 uppercase">Secure</span>
                                       </div>
                                       <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="opacity-60">RTC Latency</span>
                                          <span>&lt; 25ms</span>
                                       </div>
                                       <div className="flex items-center justify-between text-[11px] font-bold">
                                          <span className="opacity-60">Nodes Active</span>
                                          <span>PROD_1.2v</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </CardContent>
                        </Card>

                        <Card className="border-slate-100 shadow-sm bg-white overflow-hidden">
                           <CardContent className="p-6">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Upcoming Schedule</h4>
                              <div className="space-y-4">
                                 {meetings.filter(m => m.status === 'scheduled').slice(0, 3).map((m, i) => (
                                    <div key={i} className="flex gap-3 items-center">
                                       <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-900">
                                          <span className="text-[10px] font-black leading-none italic">{new Date(m.startTime).getDate()}</span>
                                          <span className="text-[7px] font-black uppercase tracking-tighter opacity-40">DAY</span>
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-[10px] font-black text-slate-900 uppercase truncate italic leading-none">{m.title}</p>
                                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                       </div>
                                    </div>
                                 ))}
                                 {meetings.filter(m => m.status === 'scheduled').length === 0 && (
                                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic text-center py-4">No events scheduled</p>
                                 )}
                              </div>
                           </CardContent>
                        </Card>
                    </div>

                    {/* Registry List */}
                    <div className="lg:col-span-3 space-y-6">
                        {loading ? (
                          <div className="flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                             <Loader2 className="animate-spin text-slate-200 h-10 w-10" />
                          </div>
                        ) : meetings.length > 0 ? (
                            <div className="space-y-4">
                                {meetings.map((meeting) => (
                                    <Card key={meeting._id} className="group border-slate-100 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center">
                                                <div className="flex-1 p-8">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {getStatusBadge(meeting.status)}
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {meeting._id.slice(-8).toUpperCase()}</span>
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase py-0.5 px-2 text-slate-400">{meeting.providerType}</Badge>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-slate-600 transition-colors">{meeting.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-6 mt-6">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={14} className="text-slate-300" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(meeting.startTime).toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-slate-300" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users size={14} className="text-slate-300" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{meeting.participants?.length + 1} Participants</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-8 border-t md:border-t-0 md:border-l border-slate-100 flex items-center gap-3 bg-slate-50/30">
                                                    {meeting.status !== 'cancelled' && (
                                                        <Button 
                                                            variant="outline" 
                                                            className="h-12 w-12 rounded-xl border-slate-200 text-slate-300 hover:text-red-500 hover:bg-red-50 hover:border-red-100" 
                                                            onClick={() => cancelMeeting(meeting._id)}
                                                        >
                                                            <XCircle size={20} />
                                                        </Button>
                                                    )}
                                                    <Button 
                                                        className="h-12 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-8 italic shadow-lg shadow-slate-200" 
                                                        disabled={meeting.status === 'cancelled'}
                                                        onClick={() => {
                                                            if (meeting.providerType === 'internal') {
                                                                router.push(`/meetings/room/${meeting._id}`);
                                                            } else {
                                                                window.open(meeting.meetingLink, '_blank');
                                                            }
                                                        }}
                                                    >
                                                        {meeting.status === 'ongoing' ? 'Join Intel' : 'Start Session'} <ExternalLink size={14} className="ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100 text-center space-y-6">
                             <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-inner border border-slate-100">
                                <VideoIcon className="h-8 w-8 text-slate-200" />
                             </div>
                             <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">No Active Sessions</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">System awaiting diligence session scheduling. Synchronize with partners via the Discover registry.</p>
                             </div>
                             <Button variant="outline" className="h-10 border-slate-200 text-[10px] font-black uppercase tracking-widest px-8 italic" onClick={() => setIsModalOpen(true)}>
                                Schedule Now
                             </Button>
                          </div>
                        )}
                    </div>
                </div>
            </div>

            <ScheduleMeetingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={fetchMeetings} 
            />
        </DashboardLayout>
    );
}
