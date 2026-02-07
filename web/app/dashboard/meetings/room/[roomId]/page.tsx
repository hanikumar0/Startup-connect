"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Users,
    Maximize2,
    ShieldCheck
} from "lucide-react";

export default function MeetingRoom() {
    const { roomId } = useParams();
    const router = useRouter();

    const [isJoined, setIsJoined] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Mock connecting to WebRTC
    const startMeeting = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            streamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            setIsJoined(true);
        } catch (err) {
            console.error("Error accessing media devices:", err);
        }
    };

    const endCall = () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
        router.push("/dashboard/meetings");
    };

    const toggleMic = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks()[0].enabled = !isMicOn;
            setIsMicOn(!isMicOn);
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks()[0].enabled = !isVideoOn;
            setIsVideoOn(!isVideoOn);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-zinc-950 text-white overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <h2 className="font-semibold">{roomId}</h2>
                    <span className="text-zinc-500 text-xs px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        E2E Encrypted
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-indigo-500 flex items-center justify-center text-[10px] font-bold">JD</div>
                        <div className="h-8 w-8 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center text-[10px] font-bold">JI</div>
                    </div>
                    <span className="text-xs text-zinc-400 font-medium tracking-wide bg-zinc-800/50 px-3 py-1.5 rounded-full border border-zinc-700/50">
                        00:15:32
                    </span>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 relative">
                <div className="flex-1 relative rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-zinc-800 group">
                    {/* Remote Video Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                        <div className="h-32 w-32 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                            <Users size={64} />
                        </div>
                        <p className="absolute bottom-6 left-6 text-sm font-medium bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">Jane Investor</p>
                    </div>
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </div>

                {/* Local Video - Floating or Sidebar */}
                <div className="w-full md:w-80 relative rounded-2xl overflow-hidden bg-zinc-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 h-60 md:h-auto self-end md:self-stretch">
                    {!isVideoOn && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                            <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-xl">JD</div>
                        </div>
                    )}
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-300 ${isVideoOn ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <p className="absolute bottom-4 left-4 text-xs font-medium bg-black/40 backdrop-blur px-2 py-1 rounded border border-white/10">You (Verified)</p>
                </div>
            </div>

            {/* Controls */}
            {!isJoined ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                    <Card className="p-10 text-center bg-zinc-900 border-zinc-800 text-white shadow-2xl">
                        <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
                        <p className="text-zinc-400 mb-8 max-w-xs mx-auto">Verified meeting between Startup and Investor. Audio and video are encrypted.</p>
                        <Button
                            onClick={startMeeting}
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 w-full rounded-xl h-14 text-lg font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                        >
                            Start Session
                        </Button>
                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span>Security Protocol: AES-256 WebRTC</span>
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="h-28 bg-zinc-900 mt-auto flex items-center justify-center gap-6 border-t border-zinc-800">
                    <Button
                        onClick={toggleMic}
                        variant={isMicOn ? "outline" : "destructive"}
                        size="icon"
                        className="h-14 w-14 rounded-full border-zinc-700 hover:bg-zinc-800 transition-all hover:scale-110 active:scale-95"
                    >
                        {isMicOn ? <Mic /> : <MicOff />}
                    </Button>
                    <Button
                        onClick={toggleVideo}
                        variant={isVideoOn ? "outline" : "destructive"}
                        size="icon"
                        className="h-14 w-14 rounded-full border-zinc-700 hover:bg-zinc-800 transition-all hover:scale-110 active:scale-95"
                    >
                        {isVideoOn ? <Video /> : <VideoOff />}
                    </Button>
                    <Button
                        onClick={endCall}
                        variant="destructive"
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg shadow-red-500/20 transition-all hover:scale-110 active:scale-95"
                    >
                        <PhoneOff />
                    </Button>
                    <div className="mx-4 h-8 w-px bg-zinc-800" />
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <Maximize2 size={20} />
                    </Button>
                </div>
            )}
        </div>
    );
}
