"use client";

import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { usePathname, useRouter } from "next/navigation";
import {
    MessageSquare,
    Bell,
    Sun,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, token, _hasHydrated } = useAuthStore();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!_hasHydrated) return;
        if (!token) {
            router.push("/login");
            return;
        }
        if (!user) return;
        const userRole = (user.role || "").trim().toUpperCase();
        if (user.isProfileCompleted === false && !pathname.includes('/onboarding')) {
            router.push(`/onboarding/${userRole.toLowerCase()}`);
        }
    }, [_hasHydrated, token, user, pathname, router]);

    useEffect(() => {
        if (!user?.id || !token) return;
        
        // Let the SocketProvider handle initialization
        // We just attach the listener to the singleton
        const socket = initSocket(token); 
        const handler = () => fetchNotifications();
        
        fetchNotifications();
        socket.on(`notification_${user.id}`, handler);
        
        return () => {
            socket.off(`notification_${user.id}`, handler);
        };
    }, [user?.id, token]);

    const fetchNotifications = async () => {
        try {
            const response = await apiFetch("/api/users/notifications");
            if (response.ok) {
                const data = await response.json();
                if (data.success) setNotifications(data.notifications);
            }
        } catch (error) {}
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!user) return null;

    const pageTitle = pathname.split('/').pop()?.toUpperCase()?.replace(/-/g, ' ') || 'OVERVIEW';
    const consoleLabel = user.role?.toUpperCase() === 'INVESTOR' ? 'INVESTOR CONSOLE' : 'STARTUP CONSOLE';

    return (
        <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Navbar Refinement */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-end px-8 shrink-0 z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 pr-4 border-r border-slate-100">
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <Sun size={18} strokeWidth={1.5} />
                            </button>
                            <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                <MessageSquare size={18} strokeWidth={1.5} />
                            </button>
                            <div className="relative">
                                <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                                    <Bell size={18} strokeWidth={1.5} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[7px] text-white font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shadow-sm group-hover:border-indigo-200 transition-all">
                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-full" /> : "RM"}
                            </div>
                            <span className="text-xs font-bold text-slate-800 tracking-tight">{user.name || "Rahul Mehta"}</span>
                        </div>
                    </div>
                </header>

                <ScrollArea className="flex-1">
                    <div className="p-10 max-w-[1600px] mx-auto min-h-screen">
                        <div className="space-y-16">
                           {children}
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
