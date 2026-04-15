"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Peer from "simple-peer";
import { useAuthStore } from "@/lib/store";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const useWebRTC = (meetingId: string) => {
    const { token, user } = useAuthStore();
    const [peers, setPeers] = useState<any[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    
    const socketRef = useRef<Socket | null>(null);
    const peersRef = useRef<any[]>([]);
    const userVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (!token || !meetingId) return;

        // 1. Setup Stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
            setStream(s);
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = s;
            }

            // 2. Setup Sockets
            socketRef.current = io(SOCKET_URL, {
                auth: { token },
                transports: ["websocket"]
            });

            socketRef.current.emit("join_meeting", meetingId);

            socketRef.current.on("participant_joined", (payload) => {
                const peer = createPeer(payload.socketId, socketRef.current!.id!, s);
                peersRef.current.push({
                    peerId: payload.socketId,
                    peer,
                    userId: payload.userId
                });
                setPeers(prev => [...prev, { peerId: payload.socketId, peer, userId: payload.userId }]);
            });

            socketRef.current.on("signal", (payload) => {
                const item = peersRef.current.find(p => p.peerId === payload.from);
                if (item) {
                    item.peer.signal(payload.signal);
                } else {
                    const peer = addPeer(payload.signal, payload.from, s);
                    peersRef.current.push({
                        peerId: payload.from,
                        peer,
                        userId: payload.userId
                    });
                    setPeers(prev => [...prev, { peerId: payload.from, peer, userId: payload.userId }]);
                }
            });

            socketRef.current.on("receive_meeting_chat", (message) => {
                setChatMessages(prev => [...prev, message]);
            });

            socketRef.current.on("participant_left", (payload) => {
                const item = peersRef.current.find(p => p.peerId === payload.socketId);
                if (item) {
                    item.peer.destroy();
                }
                const newPeers = peersRef.current.filter(p => p.peerId !== payload.socketId);
                peersRef.current = newPeers;
                setPeers(newPeers);
            });

            socketRef.current.on("meeting_ended", () => {
                console.log("⚠️ Meeting has been ended by the host");
                window.dispatchEvent(new CustomEvent("meeting_ended"));
            });
        });

        return () => {
            stream?.getTracks().forEach(track => track.stop());
            socketRef.current?.disconnect();
        };
    }, [meetingId, token]);

    function createPeer(userToSignal: string, callerId: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream
        });

        peer.on("signal", signal => {
            socketRef.current?.emit("signal", { to: userToSignal, from: callerId, signal, userId: user?.id });
        });

        return peer;
    }

    function addPeer(incomingSignal: string, callerId: string, stream: MediaStream) {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream
        });

        peer.on("signal", signal => {
            socketRef.current?.emit("signal", { to: callerId, signal, userId: user?.id });
        });

        peer.signal(incomingSignal);
        return peer;
    }

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const s = await navigator.mediaDevices.getDisplayMedia({ cursor: true } as any);
                setScreenStream(s);
                setIsScreenSharing(true);
                
                // Replace video track for all peers
                const videoTrack = s.getVideoTracks()[0];
                peersRef.current.forEach(p => {
                    p.peer.replaceTrack(
                        stream!.getVideoTracks()[0],
                        videoTrack,
                        stream!
                    );
                });

                videoTrack.onended = () => {
                    stopScreenShare();
                };

                socketRef.current?.emit("screen_share", { meetingId, sharing: true });
            } catch (err) {
                console.error("Screen share failed", err);
            }
        } else {
            stopScreenShare();
        }
    };

    const stopScreenShare = () => {
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
            const videoTrack = stream!.getVideoTracks()[0];
            peersRef.current.forEach(p => {
                p.peer.replaceTrack(
                    screenStream.getVideoTracks()[0],
                    videoTrack,
                    stream!
                );
            });
            setScreenStream(null);
            setIsScreenSharing(false);
            socketRef.current?.emit("screen_share", { meetingId, sharing: false });
        }
    };

    const sendChatMessage = (text: string) => {
        socketRef.current?.emit("meeting_chat", {
            meetingId,
            text,
            senderName: user?.name || "Participant"
        });
    };

    return {
        peers,
        stream,
        userVideoRef,
        chatMessages,
        isScreenSharing,
        toggleScreenShare,
        sendChatMessage
    };
};
