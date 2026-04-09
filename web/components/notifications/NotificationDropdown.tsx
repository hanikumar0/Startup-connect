"use client";

import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X, ExternalLink, Calendar, MessageSquare, Target, User, Sparkles } from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAuthStore } from "@/lib/store";
import { getSocket } from "@/lib/socket";

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { token, user } = useAuthStore();

    useEffect(() => {
        if (!token || !user) return;
        fetchNotifications();

        const socket = getSocket(token);
        socket.emit("auth", user.id);

        socket.on("notification", (newNotif: any) => {
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on("unread_count", ({ count }: any) => {
            setUnreadCount(count);
        });

        return () => {
            socket.off("notification");
            socket.off("unread_count");
        };
    }, [token, user]);

    const fetchNotifications = async () => {
        const res = await apiFetchJSON("/api/notifications");
        if (res.success) {
            setNotifications(res.notifications);
            setUnreadCount(res.unreadCount);
        }
    };

    const markRead = async (id: string) => {
        const res = await apiFetchJSON(`/api/notifications/read/${id}`, { method: "PUT" });
        if (res.success) {
            setNotifications(prev => prev.map((n: any) => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
    };

    const markAllRead = async () => {
        const res = await apiFetchJSON("/api/notifications/read-all", { method: "PUT" });
        if (res.success) {
            setNotifications(prev => prev.map((n: any) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'new_message': return <MessageSquare size={16} />;
            case 'meeting_request': 
            case 'meeting_accepted': return <Calendar size={16} />;
            case 'match_found': return <Target size={16} />;
            case 'profile_viewed': return <User size={16} />;
            default: return <Sparkles size={16} />;
        }
    };

    return (
        <div className="relative">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-zinc-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-4 w-4 bg-red-600 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-[400px] bg-white rounded-[2rem] border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-50 italic"
                        >
                            <div className="p-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
                                <div>
                                    <h4 className="text-sm font-black tracking-tighter text-zinc-900 uppercase italic">Digital Pulse</h4>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Real-time ecosystem updates</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={markAllRead} className="text-[9px] font-black tracking-widest text-indigo-600 hover:bg-indigo-50 uppercase italic">
                                    Calibrate All
                                </Button>
                            </div>

                            <div className="max-h-[450px] overflow-y-auto overflow-x-hidden scrollbar-hide">
                                {notifications.length > 0 ? (
                                    notifications.map((n: any) => (
                                        <div 
                                            key={n._id}
                                            onClick={() => {
                                              if (!n.isRead) markRead(n._id);
                                              if (n.link) window.location.href = n.link;
                                              setIsOpen(false);
                                            }}
                                            className={`p-6 border-b border-zinc-50 flex gap-5 cursor-pointer hover:bg-zinc-50 transition-all ${!n.isRead ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center ${
                                                !n.isRead ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                                {getTypeIcon(n.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm tracking-tight leading-snug ${!n.isRead ? 'font-black text-zinc-900' : 'font-bold text-zinc-500'}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest shrink-0 ml-2">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">{n.message}</p>
                                            </div>
                                            {!n.isRead && (
                                                <div className="mt-1 h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200">
                                            <Bell size={32} strokeWidth={1}/>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-zinc-900 uppercase italic">Silence is Strategic</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">No new alerts detected in orbit</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link href="/notifications" onClick={() => setIsOpen(false)} className="block p-5 text-center bg-zinc-50 border-t border-zinc-100 hover:bg-zinc-100 transition-colors group">
                                <span className="text-[10px] font-black tracking-widest text-zinc-500 group-hover:text-zinc-900 uppercase italic">Audit Full History</span>
                            </Link>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
