"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  MoreHorizontal,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetchJSON } from "@/lib/api";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import ScheduleMeetingModal from "@/components/meetings/ScheduleMeetingModal";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [meetings, setMeetings] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchMeetings() {
            try {
                const data = await apiFetchJSON("/api/meetings");
                if (data.success) setMeetings(data.meetings || []);
            } catch (err) {}
        }
        fetchMeetings();
    }, []);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    return (
        <DashboardLayout>
            <div className="space-y-10 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Scheduler</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Temporal <span className="text-slate-400 not-italic font-medium">/ Registry</span></h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                                <ChevronLeft size={16} />
                            </Button>
                            <span className="px-4 text-[10px] font-black uppercase tracking-widest italic">{format(currentDate, "MMMM yyyy")}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                        <Button className="h-10 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-6 italic" onClick={() => setIsModalOpen(true)}>
                            <Plus size={16} className="mr-2" /> Book Slot
                        </Button>
                    </div>
                </div>

                <Card className="border-slate-100 shadow-xl bg-white overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                            <div key={day} className="py-4 text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7">
                        {calendarDays.map((day, idx) => {
                            const dayMeetings = meetings.filter(m => isSameDay(new Date(m.startTime), day));
                            return (
                                <div 
                                    key={idx} 
                                    className={`min-h-[140px] p-4 border-r border-b border-slate-50 transition-colors hover:bg-slate-50/50 ${!isSameMonth(day, monthStart) ? 'bg-slate-50/20 opacity-40' : ''}`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-black italic ${isSameDay(day, new Date()) ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded-md' : 'text-slate-900'}`}>{format(day, "d")}</span>
                                        {dayMeetings.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />}
                                    </div>
                                    <div className="space-y-1.5">
                                        {dayMeetings.slice(0, 3).map((m, i) => (
                                            <div key={i} className="group relative bg-white border border-slate-100 rounded-lg p-2 shadow-sm hover:border-slate-300 transition-all cursor-pointer">
                                                <p className="text-[8px] font-black text-slate-900 uppercase truncate italic leading-tight">{m.title}</p>
                                                <div className="flex items-center gap-1 mt-1 opacity-40">
                                                    <Clock size={8} />
                                                    <span className="text-[7px] font-bold uppercase">{format(new Date(m.startTime), "HH:mm")}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {dayMeetings.length > 3 && (
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center pt-1">+{dayMeetings.length - 3} More</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-none shadow-sm bg-slate-900 text-white p-8">
                        <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase tracking-widest px-2 mb-4 italic">Next Session</Badge>
                        {meetings.filter(m => new Date(m.startTime) > new Date()).length > 0 ? (
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-2">
                                    {meetings.filter(m => new Date(m.startTime) > new Date())[0].title}
                                </h3>
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <CalendarIcon size={12} />
                                        <span className="text-[9px] font-bold uppercase">{format(new Date(meetings.filter(m => new Date(m.startTime) > new Date())[0].startTime), "MMM d, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span className="text-[9px] font-bold uppercase">{format(new Date(meetings.filter(m => new Date(m.startTime) > new Date())[0].startTime), "HH:mm")}</span>
                                    </div>
                                </div>
                                <Button className="w-full mt-6 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest h-10 italic">
                                    Join Intel <Video size={14} className="ml-2" />
                                </Button>
                            </div>
                        ) : (
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic pt-4">No upcoming protocols</p>
                        )}
                    </Card>

                    <Card className="col-span-2 border-slate-100 border p-8 flex items-center justify-between">
                        <div className="space-y-4">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">Google Calendar Sync</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-sm">Mirror your institutional registry with external providers for cross-platform synchronization.</p>
                            <Button variant="outline" className="h-10 border-slate-200 text-[10px] font-black uppercase tracking-widest px-8 italic">
                                Enable Google Mirror
                            </Button>
                        </div>
                        <div className="hidden lg:block h-32 w-32 bg-slate-50 rounded-full border border-slate-100 flex items-center justify-center">
                            <RefreshCw className="h-12 w-12 text-slate-200" />
                        </div>
                    </Card>
                </div>
            </div>

            <ScheduleMeetingModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={() => window.location.reload()} 
            />
        </DashboardLayout>
    );
}

function RefreshCw(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
}
