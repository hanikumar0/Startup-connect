"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Video, Calendar as CalendarIcon, Clock, Plus, ExternalLink, ArrowRight, X, User as UserIcon, Loader2 } from "lucide-react";
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
    }, []);

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

        // Mocking the creation for now, we'll add the new meeting to the state
        const newMeeting = {
            id: Math.random().toString(36).substr(2, 9),
            title: formData.title,
            partner: connections.find((c: any) => c.id === formData.partnerId)?.name || "Partner",
            date: formData.date,
            time: formData.time,
            status: "SCHEDULED",
            roomId: `room-${Math.random().toString(36).substr(2, 6)}`
        };

        // Simulate API call delay
        setTimeout(() => {
            setMeetings((prev): any => [...prev, newMeeting]);
            setIsLoading(false);
            setIsModalOpen(false);
            setFormData({ title: "", partnerId: "", date: "", time: "" });
            alert("Meeting Scheduled Successfully!");
        }, 800);
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-5xl animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meeting Center</h1>
                    <p className="text-slate-500">Manage and attend your scheduled video meetings.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 h-11 px-6 font-bold gap-2">
                    <Plus className="h-4 w-4" /> Schedule New
                </Button>
            </div>

            {meetings.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {meetings.map((meeting: any) => (
                        <Card key={meeting.id} className="border-none shadow-xl hover:shadow-2xl transition-all bg-white overflow-hidden group">
                            <div className="h-1.5 bg-indigo-600 w-full" />
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className="mb-2 text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border-indigo-100 px-2 py-0.5">
                                        {meeting.status}
                                    </Badge>
                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                        <Video size={16} />
                                    </div>
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{meeting.title}</CardTitle>
                                <CardDescription className="font-medium">with {meeting.partner}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 mt-4">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-bold">
                                        <CalendarIcon size={16} className="text-indigo-600" />
                                        {meeting.date}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 font-black font-mono">
                                        <Clock size={16} className="text-indigo-600" />
                                        {meeting.time}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <Link href={`/dashboard/meetings/room/${meeting.roomId}`}>
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 shadow-lg shadow-indigo-100 font-bold gap-2">
                                            Join Meeting <ExternalLink className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-2 border-slate-200 bg-transparent rounded-3xl">
                    <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="h-24 w-24 bg-white rounded-3xl shadow-xl shadow-slate-100 flex items-center justify-center mb-8 border border-slate-50">
                            <CalendarIcon className="h-12 w-12 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3">No Meetings Scheduled</h3>
                        <p className="max-w-md text-slate-500 mb-10 text-lg leading-relaxed">
                            You don't have any upcoming meetings. Connect with investors or startups to schedule your first pitch session.
                        </p>
                        <Button variant="outline" className="gap-3 border-slate-200 h-12 px-8 rounded-xl font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 transition-all" asChild>
                            <Link href="/dashboard/discover">
                                Find People <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Schedule Meeting Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
                    <Card className="relative w-full max-w-md border-none shadow-2xl bg-white rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="h-2 bg-indigo-600 w-full" />
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-2xl font-black text-slate-900">Schedule Meeting</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-slate-100">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <CardDescription className="text-slate-500 font-medium text-lg">Set up a session with your connections.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <form onSubmit={handleSchedule} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Meeting Title</Label>
                                    <Input
                                        required
                                        placeholder="e.g. Seed Round Q&A"
                                        className="h-12 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Partner</Label>
                                    <select
                                        required
                                        className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                        value={formData.partnerId}
                                        onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                                    >
                                        <option value="">Choose a connection...</option>
                                        {connections.map((conn: any) => (
                                            <option key={conn.id} value={conn.id}>{conn.name} ({conn.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Date</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                                            <Input
                                                required
                                                type="date"
                                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-indigo-500 font-medium"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Time</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500 pointer-events-none" />
                                            <Input
                                                required
                                                type="time"
                                                className="h-12 bg-slate-50 border-none rounded-xl pl-11 focus:ring-2 focus:ring-indigo-500 font-medium"
                                                value={formData.time}
                                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all mt-4">
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "Confirm Schedule"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
