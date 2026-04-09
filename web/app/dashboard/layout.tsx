"use client";

import { useEffect, useState, useRef } from "react";
import { initSocket, disconnectSocket } from "@/lib/socket";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Rocket,
    LayoutDashboard,
    MessageSquare,
    Video,
    FileText,
    Settings,
    LogOut,
    Search,
    Bell,
    TrendingUp,
    User,
    ShieldCheck,
    Menu,
    X,
    Eye,
    BellOff,
    ShieldAlert,
    Briefcase,
    Shield,
    ChevronUp,
    Calendar,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

interface NavItem {
    label: string;
    href: string;
    icon: any;
    role?: "STARTUP" | "INVESTOR" | "ADMIN";
}

const navItems: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Discover", href: "/discover", icon: Eye },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Meetings", href: "/meetings", icon: Calendar },
    { label: "Strategic Saves", href: "/saved", icon: ShieldCheck },
    { label: "Pitch Deck", href: "/dashboard/pitch", icon: FileText, role: "STARTUP" },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: TrendingUp, role: "INVESTOR" },
    { label: "Data Room", href: "/dashboard/vdr", icon: Shield, role: "STARTUP" },
    { label: "AI Coach", href: "/dashboard/ai-coach", icon: Zap, role: "STARTUP" },
    { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, logout, setUser, token, _hasHydrated } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeToast, setActiveToast] = useState<any>(null);
    const socketRef = useRef<any>(null);
    const fetchedRef = useRef(false);

    // 1. Auth & Route protection
    useEffect(() => {
        if (!_hasHydrated) return;

        if (!token) {
            router.push("/login");
            return;
        }

        if (!user) return;

        const userRole = (user.role || "").trim().toUpperCase();

        if (user.isProfileCompleted === false) {
            const onboardingPath = `/onboarding/${userRole.toLowerCase()}`;
            if (!pathname.includes('/onboarding')) {
                router.push(onboardingPath);
            }
        }
    }, [_hasHydrated, token, user?.isProfileCompleted, user?.role, pathname, router]);

    // 2. Socket connection & Notifications
    useEffect(() => {
        if (!user?.id || !token) return;

        fetchNotifications();

        const socket = initSocket(token);
        socketRef.current = socket;

        // Ensure user is authenticated dynamically upon connecting
        socket.emit("auth", user.id);

        const notificationHandler = (data: any) => {
            fetchNotifications();
            setActiveToast({
                title: data.type === "MESSAGE" ? "New Message" : "New Update",
                description: data.message || "You have a new notification."
            });
            setTimeout(() => setActiveToast(null), 5000);
        };

        // Prevent duplicate listeners
        socket.off(`notification_${user.id}`, notificationHandler);
        socket.on(`notification_${user.id}`, notificationHandler);

        const interval = setInterval(fetchNotifications, 60000);

        return () => {
            clearInterval(interval);
            // DO NOT DISCONNECT the socket here, just clear the specific listener.
            // Component re-renders (like StrictMode) should not terminate connection.
            if (socketRef.current) {
                socketRef.current.off(`notification_${user.id}`, notificationHandler);
            }
        };
    }, [user?.id, token]);

    useEffect(() => {
        setShowNotifications(false);
    }, [pathname]);

    const fetchNotifications = async () => {
        try {
            const response = await apiFetch("/api/users/notifications");
            if (response.ok) {
                const data = await response.json();
                if (data.success) setNotifications(data.notifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markRead = async (id: string) => {
        try {
            await apiFetch(`/api/users/notifications/${id}`, { method: "PUT" });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const handleLogout = () => {
        disconnectSocket();
        logout();
        toast.success("Successfully signed out");
        router.push("/");
    };

    if (!user) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const filteredNavItems = navItems.filter((item) => !item.role || item.role === user.role);

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
            
            {/* Minimal Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex flex-col h-full uppercase-italic-removed">
                    <div className="h-16 flex items-center px-6 border-b border-slate-100">
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
                                <Rocket size={18} />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-slate-900">Startup Connect</span>
                        </Link>
                    </div>

                    <ScrollArea className="flex-1 px-3 py-6">
                        <div className="space-y-6">
                            {/* Main Navigation */}
                            <div className="space-y-1">
                                {filteredNavItems.filter(item => item.label !== "Settings").map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${isActive
                                                ? "bg-slate-900 text-white shadow-md shadow-slate-200"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            <item.icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* My Account Section */}
                            <div className="pt-2 space-y-4">
                                <div className="px-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 italic">My Account</h3>
                                </div>
                                <div className="space-y-1">
                                    <Link
                                        href="/dashboard/settings?tab=Public Profile"
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${pathname === '/dashboard/settings' && searchParams.get('tab') === 'Public Profile'
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                    >
                                        <User size={18} className={pathname === '/dashboard/settings' && searchParams.get('tab') === 'Public Profile' ? "text-white" : "text-slate-400"} />
                                        Public Profile
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${pathname === '/dashboard/settings' && !searchParams.get('tab')
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                    >
                                        <Settings size={18} className={pathname === '/dashboard/settings' && !searchParams.get('tab') ? "text-white" : "text-slate-400"} />
                                        Settings
                                    </Link>
                                </div>

                                {/* Public Profile Card with Dropdown Menu */}
                                <div className="px-1 pt-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="w-full text-left group transition-all">
                                                <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:shadow-slate-200 group-hover:border-indigo-100 transition-all flex items-center gap-4 active:scale-95 duration-300 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ChevronUp size={12} className="text-slate-300" />
                                                    </div>
                                                    <div className="h-16 w-16 rounded-[22px] bg-[#0F172A] flex items-center justify-center text-white text-lg font-black italic shadow-lg shadow-slate-900/10">
                                                        {user.name?.split(' ').map((n: string) => n[0]).join('').toLowerCase() || 'hk'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-black text-[#0F172A] text-[13px] uppercase italic tracking-tighter truncate leading-none mb-1.5">{user.name}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider italic">{user.role}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent side="right" align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 animate-in slide-in-from-left-2">
                                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-3 italic">Quick Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-indigo-50 focus:text-indigo-600 transition-colors cursor-pointer mb-1">
                                                <Link href="/dashboard/settings?tab=Public+Profile" className="flex items-center w-full">
                                                    <User className="mr-2 h-4 w-4" />
                                                    <span className="font-bold text-xs uppercase italic tracking-widest">Public Profile</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-indigo-50 focus:text-indigo-600 transition-colors cursor-pointer mb-1">
                                                <Link href="/dashboard/settings" className="flex items-center w-full">
                                                    <Settings className="mr-2 h-4 w-4" />
                                                    <span className="font-bold text-xs uppercase italic tracking-widest">Settings</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="rounded-xl p-3 focus:bg-indigo-50 focus:text-indigo-600 transition-colors cursor-pointer">
                                                <Link href="/dashboard/settings?tab=Verification" className="flex items-center w-full">
                                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                                    <span className="font-bold text-xs uppercase italic tracking-widest">Verification</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleLogout(); }} className="rounded-xl p-3 text-red-600 focus:bg-red-50 focus:text-red-700 transition-colors cursor-pointer">
                                                <LogOut className="mr-2 h-4 w-4" />
                                                <span className="font-bold text-xs uppercase italic tracking-widest">Sign Out</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-slate-100">
                        <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                           <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${user.verificationStatus === 'VERIFIED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">{user.verificationStatus}</span>
                           </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all uppercase tracking-widest"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : ""}`}>
                <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-slate-500 rounded-lg relative"
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                                )}
                            </Button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Notifications</h4>
                                        <Badge className="bg-slate-900 text-white rounded-full text-[9px] h-5">{unreadCount}</Badge>
                                    </div>
                                    <ScrollArea className="max-h-[360px]">
                                        {notifications.length > 0 ? (
                                            <div className="divide-y divide-slate-50">
                                                {notifications.map((n) => (
                                                    <div
                                                        key={n._id}
                                                        className={`p-4 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-slate-50/50' : ''}`}
                                                        onClick={() => markRead(n._id)}
                                                    >
                                                        <p className="text-[11px] font-bold text-slate-900 leading-tight">{n.title}</p>
                                                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed opacity-70">{n.message}</p>
                                                        <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase">{new Date(n.createdAt).toLocaleTimeString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center">
                                                <BellOff size={28} className="mx-auto mb-3 text-slate-200" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active updates</p>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-slate-200" />

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white text-[10px] font-bold">
                                {user.name?.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-[11px] font-bold text-slate-900 uppercase tracking-tighter">{user.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 lg:p-10">
                    {children}
                </div>

                {activeToast && (
                    <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-8 duration-300">
                        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 min-w-[320px] border border-slate-800">
                            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                                <Bell size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest">{activeToast.title}</p>
                                <p className="text-[10px] opacity-70 font-medium">{activeToast.description}</p>
                            </div>
                            <button onClick={() => setActiveToast(null)} className="h-6 w-6 flex items-center justify-center hover:bg-white/10 rounded-md transition-all">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
