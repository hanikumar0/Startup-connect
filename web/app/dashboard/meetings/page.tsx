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
  Loader2,
  Lock,
  Timer,
  ArrowRight,
  MoreVertical,
  XCircle,
  RefreshCw,
  Video as VideoIcon,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ScheduleMeetingModal from "@/components/meetings/ScheduleMeetingModal";
import RescheduleDialog from "@/components/meetings/RescheduleDialog";
import CancellationDialog from "@/components/meetings/CancellationDialog";

export default function MeetingCenter() {
    const { user } = useAuthStore();
    const router = useRouter();
    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

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

    const getMeetingStatus = (meeting: any) => {
        if (meeting.status === 'cancelled') return 'cancelled';
        if (meeting.status === 'ended' || meeting.status === 'completed') return 'ended';

        const now = new Date();
        const start = new Date(meeting.startTime);
        const duration = meeting.duration || 30;
        const end = new Date(start.getTime() + (duration * 60000));

        if (now < start) return 'upcoming';
        if (now > end) return 'ended';
        return 'live';
    };

    const getStatusBadge = (meeting: any) => {
        const status = getMeetingStatus(meeting);
        
        switch (status) {
            case "upcoming": return <Badge className="bg-slate-200 text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-2 italic">Upcoming</Badge>;
            case "live": return <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 animate-pulse italic">Live Now</Badge>;
            case "cancelled": return <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-widest px-2 opacity-50 italic">Cancelled</Badge>;
            case "ended": return <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 opacity-50">Meeting Ended</Badge>;
            default: return <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity</p>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Meetings <span className="text-slate-400 not-italic font-medium">& Calls</span></h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        className="h-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 italic shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Plus size={16} className="mr-2" /> Create Meeting
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Insights */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-none shadow-sm bg-slate-900 text-white overflow-hidden">
                       <CardContent className="p-8">
                          <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 mb-4 italic">Platform Metrics</Badge>
                          <div className="space-y-6">
                             <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Meetings</p>
                                <h3 className="text-3xl font-black italic mt-1 leading-none">{meetings.length} <span className="text-xs not-italic opacity-40 uppercase">Upcoming</span></h3>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                </div>

                {/* List */}
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
                                                    {getStatusBadge(meeting)}
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {meeting._id.slice(-8).toUpperCase()}</span>
                                                    <Badge variant="outline" className="text-[8px] font-black uppercase py-0.5 px-2 text-slate-400">{meeting.providerType}</Badge>
                                                </div>
                                                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter group-hover:text-slate-600 transition-colors">{meeting.title}</h3>
                                                <div className="flex flex-wrap items-center gap-6 mt-6">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Calendar size={14} className="text-slate-300" />
                                                        <span>{new Date(meeting.startTime).toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <Clock size={14} className="text-slate-300" />
                                                        <span>{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-8 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center gap-3 bg-slate-50/30 min-w-[200px]">
                                                {(() => {
                                                    const status = getMeetingStatus(meeting);
                                                    const isHost = meeting.hostId?._id === user?.id || meeting.hostId === user?.id;

                                                    if (status === 'ended' || status === 'cancelled') {
                                                        return (
                                                            <div className="text-center space-y-2 opacity-40">
                                                                <Lock size={16} className="mx-auto text-slate-400" />
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic">Inactive</p>
                                                            </div>
                                                        );
                                                    }

                                                    if (status === 'upcoming') {
                                                        return (
                                                            <div className="text-center space-y-4">
                                                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Awaiting Start</p>
                                                                <Button variant="outline" className="h-8 text-[8px] font-black uppercase tracking-widest italic w-full border-slate-200" disabled>
                                                                    Locked
                                                                </Button>
                                                                {isHost && (
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        className="h-8 text-[8px] font-black text-red-400 uppercase tracking-widest hover:bg-red-50"
                                                                        onClick={() => { setSelectedMeeting(meeting); setIsCancelOpen(true); }}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div className="flex flex-col gap-2">
                                                            <Button 
                                                                className="h-10 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-6 italic w-full shadow-lg shadow-emerald-100"
                                                                onClick={() => {
                                                                    if (meeting.providerType === 'internal') {
                                                                        router.push(`/meetings/room/${meeting._id}`);
                                                                    } else {
                                                                        window.open(meeting.meetingLink, '_blank');
                                                                    }
                                                                }}
                                                            >
                                                                Join Now
                                                            </Button>
                                                            {isHost && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    className="h-8 text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50"
                                                                    onClick={() => { setSelectedMeeting(meeting); setIsCancelOpen(true); }}
                                                                >
                                                                    End Session
                                                                </Button>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        
                                        {/* Reliability Indicators */}
                                        <div className="px-8 py-4 border-t border-slate-100 bg-slate-50/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Security Integrity</span>
                                                <Badge className="text-[8px] font-black border-none px-2 py-0.5 bg-emerald-100 text-emerald-700">
                                                    ⭐ High Trust
                                                </Badge>
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
                         <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">No Active Sessions</h3>
                         <Button variant="outline" className="h-10 border-slate-200 text-[10px] font-black uppercase tracking-widest px-8 italic" onClick={() => setIsModalOpen(true)}>
                            Schedule Now
                         </Button>
                      </div>
                    )}
                </div>
            </div>

            <ScheduleMeetingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={fetchMeetings} 
            />

            {selectedMeeting && (
                <>
                    <RescheduleDialog 
                        isOpen={isRescheduleOpen}
                        onClose={() => setIsRescheduleOpen(false)}
                        meeting={selectedMeeting}
                        onRefresh={fetchMeetings}
                    />
                    <CancellationDialog 
                        isOpen={isCancelOpen}
                        onClose={() => setIsCancelOpen(false)}
                        meeting={selectedMeeting}
                        onRefresh={fetchMeetings}
                    />
                </>
            )}
        </div>
    );
}
