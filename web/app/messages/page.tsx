"use client";

import { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MessageSquare, Send, Paperclip, MoreVertical, Search, Calendar, Briefcase, ChevronRight, Loader2, Sparkles, Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import useChat from "@/hooks/useChat";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { MessageSkeleton } from "@/components/ui/skeletons";

export default function MessagesPage() {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConv, setActiveConv] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, setMessages, isTyping, sendMessage, sendTyping } = useChat(activeConv?._id || null);

    useEffect(() => {
        async function fetchConversations() {
            try {
                const data = await apiFetchJSON("/api/messages/conversations");
                if (data.success) setConversations(data.data);
            } catch (err) { console.error("Chats fail", err); }
            finally { setLoading(false); }
        }
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConv) {
            async function fetchMessages() {
                try {
                    const data = await apiFetchJSON(`/api/messages/${activeConv._id}`);
                    if (data.success) setMessages(data.data);
                } catch (err) { console.error("Messages fail", err); }
            }
            fetchMessages();
        }
    }, [activeConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || !activeConv) return;
        sendMessage(text);
        setText("");
        sendTyping(false);
    };

    const getOtherParticipant = (conv: any) => {
      return conv.participants.find((p: any) => p._id !== user?.id && p.id !== user?.id);
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-140px)] border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm">
                
                {/* Conversations Sidebar */}
                <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
                    <div className="p-6 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Messages</h1>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-slate-300">
                               <Sparkles size={16} />
                            </Button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input placeholder="SEARCH MESSAGES..." className="pl-10 h-10 border-slate-200 bg-slate-50 text-[10px] font-black uppercase tracking-widest focus-visible:ring-slate-200" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {loading ? (
                          <div className="p-4 space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-md" />
                            ))}
                          </div>
                        ) : conversations.length > 0 ? (
                            conversations.map((conv) => {
                                const other = getOtherParticipant(conv);
                                const active = activeConv?._id === conv._id;
                                if (!other) return null;

                                return (
                                    <div
                                        key={conv._id}
                                        onClick={() => setActiveConv(conv)}
                                        className={cn(
                                            "flex items-center gap-3 p-4 cursor-pointer border-b border-slate-50 transition-all",
                                            active ? "bg-white border-l-4 border-l-slate-900" : "hover:bg-white"
                                        )}
                                    >
                                        <Avatar className="h-10 w-10 rounded-lg border border-slate-100 shadow-sm">
                                            <AvatarImage src={other.avatar} />
                                            <AvatarFallback className="bg-slate-900 text-white font-black text-[10px] uppercase">{other.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{other.name}</p>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">12:45 PM</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate font-semibold opacity-70">
                                                {conv.lastMessage?.text || "No messages yet"}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                          <div className="p-12 text-center">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No active conversations</p>
                          </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {activeConv ? (
                        <>
                            <header className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white shadow-sm relative z-10">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 rounded-lg border border-slate-100 shadow-sm">
                                        <AvatarImage src={getOtherParticipant(activeConv).avatar} />
                                        <AvatarFallback className="bg-slate-900 text-white font-black">{getOtherParticipant(activeConv).name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs font-black text-slate-900 uppercase italic tracking-tight">{getOtherParticipant(activeConv).name}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm" />
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{getOtherParticipant(activeConv).role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" className="h-9 border-slate-200 text-[9px] font-black uppercase tracking-widest px-4 italic">
                                       <Calendar size={12} className="mr-2" /> Schedule
                                    </Button>
                                     <Button variant="outline" className="h-9 border-slate-200 text-[9px] font-black uppercase tracking-widest px-4 italic">
                                        <Briefcase size={12} className="mr-2" /> Business Details
                                     </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300"><MoreVertical size={16} /></Button>
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/20">
                                {messages.map((msg, idx) => {
                                    const senderId = msg.senderId?._id || msg.senderId?.id || msg.senderId;
                                    const isMe = senderId === user?.id;
                                    return (
                                        <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[70%] p-5 rounded-xl text-xs font-semibold shadow-sm transition-all",
                                                isMe ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-900 rounded-tl-none"
                                            )}>
                                                {msg.text}
                                                <div className={cn(
                                                  "flex items-center gap-1 text-[8px] mt-2 font-black uppercase tracking-widest",
                                                  isMe ? "justify-end text-white/50" : "justify-start text-slate-300"
                                                )}>
                                                  12:45 PM {isMe && <CheckCheck size={10} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <footer className="p-6 border-t border-slate-100 bg-white">
                                <form onSubmit={handleSend} className="flex items-center gap-3">
                                    <Button type="button" variant="ghost" size="icon" className="h-12 w-12 text-slate-300 hover:text-slate-900 transition-colors">
                                       <Paperclip size={20} />
                                    </Button>
                                    <Input
                                        placeholder="TYPE YOUR MESSAGE..."
                                        className="flex-1 h-12 border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-widest focus-visible:ring-slate-200"
                                        value={text}
                                        onChange={(e) => {
                                          setText(e.target.value);
                                          sendTyping(true);
                                        }}
                                    />
                                    <Button type="submit" className="h-12 w-12 bg-slate-900 text-white p-0 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all rounded-xl">
                                        <Send size={20} />
                                    </Button>
                                </form>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                <MessageSquare className="h-8 w-8 text-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Your Inbox</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Select a contact from the list to start chatting.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
