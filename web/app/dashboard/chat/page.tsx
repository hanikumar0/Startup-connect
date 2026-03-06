"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User as UserIcon, Building, Search, MessageSquare, Loader2, Check, CheckCheck } from "lucide-react";
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
    connectionId: string;
}

export default function ChatPage() {
    const [user, setUser] = useState<any>(null);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Connection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getConversationId = (id1: string, id2: string) => [id1, id2].sort().join("_");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Add unique ID for the user if not present (using stored data)
            setUser(parsedUser);
            fetchConnections();
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        // Connect to backend
        socketRef.current = io(process.env.NEXT_PUBLIC_API_URL || "");

        // Listen for incoming messages
        socketRef.current.on("receive_message", (message: Message) => {
            if (selectedPartner && message.conversationId === getConversationId(user.id, selectedPartner.id)) {
                setMessages((prev) => [...prev, message]);
                // Automatically mark as read if we are in the chat
                socketRef.current?.emit("mark_messages_read", {
                    conversationId: message.conversationId,
                    userId: user.id
                });
            }
        });

        // Listen for read status updates
        socketRef.current.on("messages_marked_read", ({ conversationId }: { conversationId: string }) => {
            if (selectedPartner && conversationId === getConversationId(user.id, selectedPartner.id)) {
                setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
            }
        });

        // Listen for typing events
        socketRef.current.on("user_typing", ({ userId }: { userId: string }) => {
            if (selectedPartner && userId === selectedPartner.id) {
                setPartnerTyping(true);
            }
        });

        socketRef.current.on("user_stop_typing", ({ userId }: { userId: string }) => {
            if (selectedPartner && userId === selectedPartner.id) {
                setPartnerTyping(false);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user, selectedPartner]);

    useEffect(() => {
        if (selectedPartner && user) {
            setPartnerTyping(false);
            const convId = getConversationId(user.id, selectedPartner.id);
            socketRef.current?.emit("join_room", convId);
            fetchMessages(convId);
            // Mark existing messages as read
            socketRef.current?.emit("mark_messages_read", {
                conversationId: convId,
                userId: user.id
            });
        }
    }, [selectedPartner]);

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
        } catch (error) {
            console.error("Error fetching connections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const response = await apiFetch(`/api/chat/messages/${convId}`);
            const data = await response.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !socketRef.current || !selectedPartner || !user) return;

        const convId = getConversationId(user.id, selectedPartner.id);
        const messageData = {
            conversationId: convId,
            senderId: user.id,
            receiverId: selectedPartner.id,
            text: inputText,
        };

        socketRef.current.emit("send_message", messageData);
        socketRef.current.emit("stop_typing", { conversationId: convId, userId: user.id });
        setInputText("");
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (!socketRef.current || !selectedPartner || !user) return;

        const convId = getConversationId(user.id, selectedPartner.id);
        socketRef.current.emit("typing", { conversationId: convId, userId: user.id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit("stop_typing", { conversationId: convId, userId: user.id });
        }, 2000);
    };

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-120px)] gap-6 animate-in fade-in duration-500">
            {/* Conversations Sidebar */}
            <Card className="w-80 flex flex-col border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="p-4 border-b">
                    <CardTitle className="text-lg font-bold">Messages</CardTitle>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input placeholder="Search chats..." className="pl-9 h-9 text-xs bg-slate-50 border-none outline-none focus-visible:ring-1 focus-visible:ring-indigo-500" />
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {connections.length > 0 ? connections.map((conn) => (
                            <div
                                key={conn.connectionId}
                                onClick={() => setSelectedPartner(conn)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${selectedPartner?.id === conn.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                            >
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${selectedPartner?.id === conn.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {conn.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">{conn.name}</p>
                                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-60 font-mono mt-0.5">{conn.role}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center">
                                <MessageSquare className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-xs text-slate-400 font-medium leading-relaxed">No connections yet. Discover people to start chatting!</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </Card>

            {/* Chat Content */}
            <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl bg-white">
                {selectedPartner ? (
                    <>
                        <CardHeader className="border-b bg-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                                    {selectedPartner.name.charAt(0)}
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900">{selectedPartner.name}</CardTitle>
                                    <p className="text-xs text-green-500 font-bold uppercase tracking-wider">Online</p>
                                </div>
                            </div>
                        </CardHeader>

                        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center text-slate-300 py-20 italic text-sm">
                                        Start your encrypted conversation with {selectedPartner.name}.
                                    </div>
                                )}
                                {messages.map((msg, index) => {
                                    const isMine = msg.senderId === user.id;
                                    return (
                                        <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMine
                                                ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100"
                                                : "bg-slate-100 text-slate-900 rounded-tl-none shadow-slate-50"
                                                }`}>
                                                <p className="text-sm">{msg.text}</p>
                                                <div className={`mt-1 text-[10px] opacity-70 flex items-center justify-end gap-1 ${isMine ? "text-white" : "text-slate-400"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMine && (
                                                        msg.isRead ? (
                                                            <CheckCheck className="h-3 w-3 text-white" />
                                                        ) : (
                                                            <Check className="h-3 w-3 text-white/60" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {partnerTyping && (
                                    <div className="flex justify-start animate-in fade-in duration-300">
                                        <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <CardFooter className="border-t bg-slate-50/50 p-4">
                            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-3">
                                <Input
                                    placeholder="Type your message..."
                                    value={inputText}
                                    onChange={handleTyping}
                                    className="h-12 border-slate-200 bg-white shadow-sm focus-visible:ring-indigo-500"
                                />
                                <Button type="submit" size="icon" className="h-12 w-12 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 shrink-0">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <MessageSquare className="h-10 w-10 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Conversation</h3>
                        <p className="max-w-xs text-sm font-medium leading-relaxed">Choose an active connection from the left to start formal discussions or pitch reviews.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

