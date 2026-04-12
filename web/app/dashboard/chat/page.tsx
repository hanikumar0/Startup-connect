"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Loader2, Check, CheckCheck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface Message {
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    isRead: boolean;
    createdAt: Date;
}

interface Connection {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    connectionId: string;
    conversationId?: string;
    lastMessage?: {
        text: string;
        at: string;
    };
}

export default function ChatPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Connection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout| null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchConnections();
        }
    }, []);

    const socket = getSocket();

    useEffect(() => {
        if (!user || !socket) return;
        const receiveMessageHandler = (message: Message) => {
            if (selectedPartner && message.conversationId === selectedPartner.conversationId) {
                setMessages((prev) => [...prev, message]);
                socket.emit("mark_messages_read", {
                    conversationId: message.conversationId,
                    userId: user.id
                });
            }
        };
        const readHandler = ({ conversationId }: { conversationId: string }) => {
            if (selectedPartner && conversationId === selectedPartner.conversationId) {
                setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
            }
        };
        const typingHandler = ({ senderId, isTyping }: { senderId: string, isTyping: boolean }) => {
            if (selectedPartner && senderId === selectedPartner.id) {
                setPartnerTyping(isTyping);
            }
        };
        socket.on("receive_message", receiveMessageHandler);
        socket.on("messages_marked_read", readHandler);
        socket.on("user_typing", typingHandler);
        return () => {
            socket.off("receive_message", receiveMessageHandler);
            socket.off("messages_marked_read", readHandler);
            socket.off("user_typing", typingHandler);
        };
    }, [user, selectedPartner, socket]);

    useEffect(() => {
        if (selectedPartner?.conversationId && user && socket) {
            setPartnerTyping(false);
            const convId = selectedPartner.conversationId;
            socket.emit("join_conversation", convId);
            fetchMessages(convId);
            socket.emit("mark_messages_read", {
                conversationId: convId,
                userId: user.id
            });
        }
    }, [selectedPartner, user, socket]);

    const fetchConnections = async () => {
        try {
            const response = await apiFetch("/api/users/connections");
            const data = await response.json();
            if (data.success) {
                setConnections(data.connections);
                if (data.connections.length > 0) {
                    setSelectedPartner(data.connections[0]);
                }
            }
        } catch (error) {} finally { setIsLoading(false); }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const response = await apiFetch(`/api/chat/messages/${convId}`);
            const data = await response.json();
            if (data.success) setMessages(data.messages);
        } catch (error) {}
    };

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !socket || !selectedPartner?.conversationId || !user) return;
        const convId = selectedPartner.conversationId;
        const messageData = {
            conversationId: convId,
            senderId: user.id,
            receiverId: selectedPartner.id,
            text: inputText,
        };
        socket.emit("send_message", messageData);
        socket.emit("stop_typing", { conversationId: convId, userId: user.id });
        setInputText("");
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (!socket || !selectedPartner?.conversationId || !user) return;
        const convId = selectedPartner.conversationId;
        socket.emit("typing", { conversationId: convId, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", { conversationId: convId, isTyping: false });
        }, 2000);
    };

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) viewport.scrollTop = viewport.scrollHeight;
        }
    }, [messages]);

    if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>;

    return (
        <div className="space-y-4 h-[calc(100vh-220px)] flex flex-col">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between py-1 border-b border-slate-50 shrink-0">
               <div className="flex items-center gap-4">
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">Direct Messaging</h2>
                  <div className="flex items-center gap-1.5">
                     <span className="text-[8px] font-black uppercase text-slate-400">Total Chats:</span>
                     <span className="text-[11px] font-black text-slate-700">{connections.length}</span>
                  </div>
               </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Conversations Sidebar */}
                <Card className="w-72 flex flex-col border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden shrink-0">
                    <CardHeader className="p-3 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                            <Input placeholder="Filter chats..." className="pl-9 h-8 text-[10px] bg-slate-50 border-none rounded-lg font-bold" />
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-slate-50">
                            {connections.map((conn) => (
                                <div
                                    key={conn.connectionId}
                                    onClick={() => setSelectedPartner(conn)}
                                    className={`flex items-center gap-2.5 p-3 cursor-pointer transition-all ${selectedPartner?.id === conn.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs relative border border-slate-100 shrink-0 shadow-inner">
                                        {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover rounded-lg" /> : conn.name.charAt(0)}
                                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-slate-900 truncate leading-tight">{conn.name}</p>
                                        <p className="text-[8px] font-bold text-slate-400 truncate mt-0.5 italic">
                                            {conn.lastMessage ? conn.lastMessage.text : "No messages yet"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Main Chat Area - Fixed Height and Robust Flex */}
                <Card className="flex-1 flex flex-col min-w-0 border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden">
                    {selectedPartner ? (
                        <div className="flex flex-col h-full"> {/* Inner flex container */}
                            <CardHeader className="border-b border-slate-50 bg-white px-5 py-3 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 relative shadow-inner">
                                            {selectedPartner.avatar ? <img src={selectedPartner.avatar} className="w-full h-full object-cover rounded-lg" /> : selectedPartner.name.charAt(0)}
                                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 leading-tight">{selectedPartner.name}</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{selectedPartner.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" className="h-7 rounded-md text-[8px] font-black uppercase tracking-widest border-slate-100 px-3 text-slate-400 hover:text-indigo-600 transition-colors">Profile</Button>
                                        <Button variant="outline" className="h-7 rounded-md text-[8px] font-black uppercase tracking-widest border-slate-100 px-3 text-slate-400 hover:text-indigo-600 transition-colors">Meetings</Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="flex-1 min-h-0 relative bg-slate-50/10">  {/* Scroll container wrapper */}
                                <ScrollArea className="h-full w-full" ref={scrollRef}>
                                    <div className="p-5 space-y-4">
                                        {messages.map((msg, index) => {
                                            const isMine = msg.senderId === user.id;
                                            return (
                                                <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[80%] rounded-xl px-4 py-2 shadow-sm relative group ${isMine
                                                        ? "bg-slate-900 text-white rounded-tr-none"
                                                        : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                                        }`}>
                                                        <p className="text-[11px] font-bold leading-relaxed">{msg.text}</p>
                                                        <div className={`mt-1 text-[7px] font-black uppercase tracking-widest flex items-center justify-end gap-1.5 ${isMine ? "text-white/40" : "text-slate-300"}`}>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {isMine && (msg.isRead ? <CheckCheck size={9} /> : <Check size={9} />)}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {partnerTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-slate-100 rounded-lg px-2.5 py-1 shadow-sm">
                                                    <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-widest animate-pulse italic">Partner is typing...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            <CardFooter className="border-t border-slate-50 bg-white p-3 shrink-0">
                                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                                    <div className="flex-1 relative">
                                       <Input
                                          placeholder="Type message..."
                                          value={inputText}
                                          onChange={handleTyping}
                                          className="h-9 pl-3 pr-10 bg-slate-50 border-none rounded-lg text-[10px] font-bold shadow-inner"
                                       />
                                    </div>
                                    <Button type="submit" size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg shadow-sm shrink-0 transition-all">
                                        <Send size={14} />
                                    </Button>
                                </form>
                            </CardFooter>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/5">
                            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center mb-4 transition-all hover:scale-105">
                                <MessageSquare className="h-6 w-6 text-slate-200" />
                            </div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Select Thread</h3>
                            <p className="max-w-xs text-[10px] text-slate-400 font-bold mt-1 opacity-70 italic">Pick a connection to view conversation history.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
