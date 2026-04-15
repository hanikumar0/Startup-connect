"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff, 
  Monitor, 
  MessageSquare, 
  Users, 
  Settings, 
  LogOut,
  Send,
  MoreHorizontal,
  LayoutGrid,
  ShieldCheck,
  BadgeCheck,
  ChevronRight,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebRTC } from "@/lib/hooks/useWebRTC";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function MeetingRoomPage() {
    const params = useParams();
    const meetingId = params.id as string;
    const router = useRouter();
    const { user } = useAuthStore();
    
    const [meeting, setMeeting] = useState<any>(null);
    const [muted, setMuted] = useState(false);
    const [videoOff, setVideoOff] = useState(false);
    const [chatOpen, setChatOpen] = useState(true);
    const [chatInput, setChatInput] = useState("");

    const {
        peers,
        stream,
        userVideoRef,
        chatMessages,
        isScreenSharing,
        toggleScreenShare,
        sendChatMessage
    } = useWebRTC(meetingId);

    useEffect(() => {
        async function fetchMeeting() {
            try {
                const res = await apiFetchJSON(`/api/meetings/${meetingId}`);
                if (res.success) setMeeting(res.meeting);
            } catch (err) {
                toast.error("Failed to load meeting registry");
            }
        }
        fetchMeeting();
    }, [meetingId]);

    useEffect(() => {
        const handleMeetingEnded = () => {
            toast.info("Meeting has been terminated by host");
            router.push("/dashboard/meetings");
        };

        window.addEventListener("meeting_ended", handleMeetingEnded);
        return () => window.removeEventListener("meeting_ended", handleMeetingEnded);
    }, [router]);

    const handleDisconnect = async () => {
        try {
            // Trigger backend disconnect protocol
            await apiFetchJSON(`/api/meetings/${meetingId}/disconnect`, {
                method: "POST"
            });
            
            // Redirect immediately (Backend handles ending meeting if host)
            router.push("/dashboard/meetings");
        } catch (err) {
            console.error("Disconnect failure", err);
            router.push("/dashboard/meetings"); // Fallback redirect
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendChatMessage(chatInput);
            setChatInput("");
        }
    };

    const toggleMute = () => {
        if (stream) {
            stream.getAudioTracks()[0].enabled = muted;
            setMuted(!muted);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            stream.getVideoTracks()[0].enabled = videoOff;
            setVideoOff(!videoOff);
        }
    };

    if (!meeting) return null;

    return (
        <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden text-slate-100 font-sans">
            {/* Institution Header */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 shadow-inner">
                        <ShieldCheck className="text-emerald-400 h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black uppercase tracking-widest italic">{meeting.title}</h1>
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[7px] font-black uppercase tracking-[0.2em] px-2 italic">Secure Call</Badge>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                            Meeting ID: {meetingId.slice(-12)} <ChevronRight size={8} /> <Timer size={8} /> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2 mr-4">
                        {[1, 2, 3].map(i => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-slate-900">
                                <AvatarFallback className="bg-slate-800 text-[10px] font-black">P{i}</AvatarFallback>
                            </Avatar>
                        ))}
                        <div className="h-8 w-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-black">+{peers.length + 1}</div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/5">
                        <Settings size={18} />
                    </Button>
                    <Button 
                        variant="destructive" 
                        className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-6 h-10 italic shadow-lg shadow-red-500/20"
                        onClick={handleDisconnect}
                    >
                        Disconnect <LogOut size={14} className="ml-2" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Video Grid */}
                <div className="flex-1 p-6 relative bg-slate-950 overflow-y-auto">
                    <div className={`grid gap-4 h-full ${peers.length === 0 ? 'grid-cols-1' : peers.length === 1 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                        {/* User Video */}
                        <Card className="relative aspect-video bg-slate-900 border-white/5 overflow-hidden group shadow-2xl">
                             <video ref={userVideoRef} autoPlay muted playsInline className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                <Avatar className="h-6 w-6 border border-white/20">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="bg-slate-800 text-[8px] font-black">ME</AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white shadow-sm italic">You (Host)</span>
                             </div>
                             {muted && (
                                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-red-500 flex items-center justify-center animate-in zoom-in">
                                    <MicOff size={14} className="text-white" />
                                </div>
                             )}
                        </Card>

                        {/* Peer Videos */}
                        {peers.map((peer, i) => (
                            <VideoCard key={i} peer={peer.peer} userId={peer.userId} />
                        ))}
                    </div>
                </div>

                {/* Chat Panel */}
                {chatOpen && (
                    <aside className="w-96 border-l border-white/5 bg-slate-900/30 backdrop-blur-3xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic flex items-center gap-2">
                                <MessageSquare size={14} className="text-emerald-400" /> Meeting Chat
                            </h2>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => setChatOpen(false)}>
                                <X size={16} />
                            </Button>
                        </div>
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {chatMessages.map((msg, i) => (
                                    <div key={i} className={`space-y-1 ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{msg.senderName}</span>
                                            <span className="text-[7px] text-slate-600 font-bold uppercase">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] ${msg.senderId === user?.id ? 'bg-emerald-500 text-white rounded-tr-none ml-auto' : 'bg-white/5 text-slate-300 rounded-tl-none'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <form onSubmit={handleSendMessage} className="p-6 border-t border-white/5 bg-slate-950/20">
                            <div className="relative">
                                <Input 
                                    className="h-14 bg-white/5 border-white/5 pr-14 text-xs focus-visible:ring-emerald-500/30 rounded-2xl" 
                                    placeholder="Enter encrypted message..." 
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                />
                                <Button type="submit" size="icon" className="absolute right-2 top-2 h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                                    <Send size={18} />
                                </Button>
                            </div>
                        </form>
                    </aside>
                )}
            </main>

            {/* Matrix Controls */}
            <footer className="h-24 px-8 border-t border-white/5 bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center relative">
                <div className="flex items-center gap-4 bg-slate-800/40 p-2 rounded-2xl border border-white/5 shadow-2xl">
                    <Button 
                        variant={muted ? "destructive" : "ghost"} 
                        size="icon" 
                        className={`h-14 w-14 rounded-xl transition-all ${muted ? 'bg-red-500 hover:bg-red-600' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        onClick={toggleMute}
                    >
                        {muted ? <MicOff size={22} /> : <Mic size={22} />}
                    </Button>
                    <Button 
                        variant={videoOff ? "destructive" : "ghost"} 
                        size="icon" 
                        className={`h-14 w-14 rounded-xl transition-all ${videoOff ? 'bg-red-500 hover:bg-red-600' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        onClick={toggleVideo}
                    >
                        {videoOff ? <VideoOff size={22} /> : <VideoIcon size={22} />}
                    </Button>
                    <div className="w-[1px] h-8 bg-white/5 mx-2" />
                    <Button 
                        variant={isScreenSharing ? "default" : "ghost"} 
                        size="icon" 
                        className={`h-14 w-14 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        onClick={toggleScreenShare}
                    >
                        <Monitor size={22} />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-14 w-14 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 ${chatOpen ? 'bg-white/5 text-emerald-400' : ''}`}
                        onClick={() => setChatOpen(!chatOpen)}
                    >
                        <MessageSquare size={22} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
                        <Users size={22} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl text-slate-400 hover:text-white hover:bg-white/5">
                        <MoreHorizontal size={22} />
                    </Button>
                </div>

                <div className="absolute right-8 flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Call Quality</p>
                        <div className="flex gap-1">
                            <div className="h-3 w-1 bg-emerald-500 rounded-full" />
                            <div className="h-3 w-1 bg-emerald-500 rounded-full" />
                            <div className="h-3 w-1 bg-emerald-500 rounded-full" />
                            <div className="h-3 w-1 bg-slate-700 rounded-full" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function VideoCard({ peer, userId }: { peer: any, userId: string }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [remoteUser, setRemoteUser] = useState<any>(null);

    useEffect(() => {
        peer.on("stream", (remoteStream: MediaStream) => {
            if (videoRef.current) {
                videoRef.current.srcObject = remoteStream;
            }
        });

        async function fetchUser() {
            try {
                const res = await apiFetchJSON(`/api/users/${userId}`); // Assuming this exists
                if (res.success) setRemoteUser(res.user);
            } catch (err) {}
        }
        if (userId) fetchUser();
    }, [peer, userId]);

    return (
        <Card className="relative aspect-video bg-slate-900 border-white/5 overflow-hidden group shadow-2xl">
            <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-white/20">
                    <AvatarImage src={remoteUser?.avatar} />
                    <AvatarFallback className="bg-slate-800 text-[8px] font-black">{remoteUser?.name?.[0] || 'P'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic">{remoteUser?.name || 'Participant'}</span>
                    <span className="text-[7px] text-emerald-400 font-bold uppercase tracking-widest">Connected</span>
                </div>
            </div>
        </Card>
    );
}

function X(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
}
