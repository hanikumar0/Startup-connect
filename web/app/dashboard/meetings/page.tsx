"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Calendar as CalendarIcon, Clock, Plus, ArrowRight, X, Loader2, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

export default function MeetingCenter() {
    const [meetings, setMeetings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connections, setConnections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        partnerId: "",
        date: "",
        time: ""
    });

    useEffect(() => {
        fetchConnections();
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await apiFetch("/api/meetings/my-meetings");
            const data = await response.json();
            if (data.success) {
                setMeetings(data.meetings);
            }
        } catch (error) {
            console.error("Error fetching meetings:", error);
        }
    };

    const fetchConnections = async () => {
        try {
            const response = await apiFetch("/api/users/connections");
            const data = await response.json();
            if (data.success) {
                setConnections(data.connections);
            }
        } catch (error) {
            console.error("Error fetching connections:", error);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const [year, month, day] = formData.date.split("-");
        const [hour, minute] = formData.time.split(":");
        const startTime = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));

        try {
            const response = await apiFetch("/api/meetings/schedule", {
                method: "POST",
                body: JSON.stringify({
                    guestId: formData.partnerId,
                    title: formData.title,
                    startTime: startTime.toISOString()
                }),
            });
            const data = await response.json();
            if (data.success) {
                setMeetings((prev): any => [...prev, data.meeting]);
                setIsModalOpen(false);
                setFormData({ title: "", partnerId: "", date: "", time: "" });
            }
        } catch (error) {
            console.error("Error scheduling meeting:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Simple Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-50">
               <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                     <span>Meetings</span>
                     <ChevronRight size={8} className="text-slate-300" />
                     <span className="text-slate-900/60 font-bold">Schedule</span>
                  </div>
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    Your Meetings
                  </h1>
               </div>
               
               <div className="flex items-center gap-8 text-right">
                  <div>
                     <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Sessions</p>
                     <p className="text-sm font-bold text-slate-900">{meetings.length}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50/50 p-6 rounded-xl border border-slate-100 gap-4">
               <div>
                  <h3 className="text-sm font-bold text-slate-900">Schedule New Session</h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-0.5">Invite your connections to a video call.</p>
               </div>
               <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-slate-900 text-white h-9 px-6 rounded-lg font-bold uppercase text-[10px] tracking-widest gap-2">
                    <Plus size={14} /> 
                    New Meeting
                </Button>
            </div>

            {meetings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {meetings.map((meeting: any) => (
                        <Card key={meeting._id || meeting.id} className="border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden group">
                            <CardHeader className="p-5 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[8px] uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                        {meeting.status}
                                    </Badge>
                                    <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Video size={16} />
                                    </div>
                                </div>
                                <CardTitle className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{meeting.title}</CardTitle>
                                <CardDescription className="font-bold text-[9px] uppercase tracking-widest text-slate-400">With {meeting.partner}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-50 mb-5 group-hover:bg-indigo-50/50 transition-colors">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold group-hover:text-slate-900 transition-colors">
                                            <CalendarIcon size={14} className="text-indigo-600" />
                                            {new Date(meeting.startTime || meeting.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-bold group-hover:text-slate-900 transition-colors">
                                            <Clock size={14} className="text-indigo-600" />
                                            {meeting.startTime ? new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : meeting.time}
                                        </div>
                                    </div>
                                </div>

                                <Link href={`/dashboard/meetings/room/${meeting.roomId}`}>
                                    <Button className="w-full h-10 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2">
                                        Join Room <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="h-16 w-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <CalendarIcon className="h-8 w-8 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Meetings Scheduled</h3>
                    <p className="max-w-xs mx-auto text-[11px] font-medium text-slate-400 mt-2 italic leading-relaxed">
                        Schedule a meeting with your connections to discuss opportunities and collaborations.
                    </p>
                    <Button variant="outline" className="mt-8 h-10 px-6 rounded-lg font-bold text-[10px] uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-all" asChild>
                        <Link href="/dashboard/discover">
                            Find Connections
                        </Link>
                    </Button>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                   <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-1">New Session</div>
                                   <h2 className="text-xl font-bold text-slate-900">Schedule Meeting</h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="h-10 w-10 text-slate-400">
                                    <X size={18} />
                                </Button>
                            </div>
                            
                            <form onSubmit={handleSchedule} className="space-y-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Meeting Title</Label>
                                    <Input
                                        required
                                        placeholder="Discussion Title"
                                        className="h-11 bg-slate-50 border-slate-100 rounded-lg px-4 text-xs font-medium"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5 relative">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Participant</Label>
                                    <select
                                        required
                                        className="w-full h-11 bg-slate-50 border-slate-100 rounded-lg px-4 text-xs font-bold outline-none appearance-none"
                                        value={formData.partnerId}
                                        onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                                    >
                                        <option value="">Select Connection...</option>
                                        {connections.map((conn: any) => (
                                            <option key={conn.id} value={conn.id}>{conn.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Date</Label>
                                        <Input
                                            required
                                            type="date"
                                            className="h-11 bg-slate-50 border-slate-100 rounded-lg px-4 text-xs"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Time</Label>
                                        <Input
                                            required
                                            type="time"
                                            className="h-11 bg-slate-50 border-slate-100 rounded-lg px-4 text-xs"
                                            value={formData.time}
                                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full h-11 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg shadow-sm mt-4">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Schedule Meeting"}
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
