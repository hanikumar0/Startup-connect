"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    Zap,
    AlertCircle,
    Users,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { CommandPalette } from "@/components/CommandPalette";
import { apiFetch } from "@/lib/api";

interface NavItem {
    label: string;
    href: string;
    icon: any;
    role?: "STARTUP" | "INVESTOR" | "ADMIN";
}

const navItems: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Discover", href: "/dashboard/discover", icon: Eye },
    { label: "Messages", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Pitch Deck", href: "/dashboard/pitch", icon: FileText, role: "STARTUP" },
    { label: "Portfolio", href: "/dashboard/portfolio", icon: TrendingUp, role: "INVESTOR" },
    { label: "Syndicates", href: "/dashboard/deals", icon: Users, role: "INVESTOR" },
    { label: "Meetings", href: "/dashboard/meetings", icon: Video },
    { label: "Data Room", href: "/dashboard/vdr", icon: ShieldAlert, role: "STARTUP" },
    { label: "Pipeline", href: "/dashboard/pipeline", icon: TrendingUp, role: "STARTUP" },
    { label: "Term Sheet", href: "/dashboard/term-sheet", icon: FileText },
    { label: "AI Coach", href: "/dashboard/ai-coach", icon: Zap, role: "STARTUP" },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeToast, setActiveToast] = useState<any>(null);
    const [globalSearch, setGlobalSearch] = useState("");
    const socketRef = useRef<any>(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const userRole = (parsedUser.role || "").trim().toUpperCase();

        // STRICT GUARD: Only redirect if profile is explicitly NOT completed 
        // AND we are not already navigating to onboarding
        if (parsedUser.isProfileCompleted === false || parsedUser.isProfileCompleted === "false") {
            const onboardingPath = `/onboarding/${userRole.toLowerCase()}`;
            if (!pathname.includes('/onboarding')) {
                router.push(onboardingPath);
                return;
            }
        }

        if (!fetchedRef.current) {
            fetchNotifications();

            // Real-time notification socket - Initialize only once
            if (!socketRef.current) {
                socketRef.current = io(process.env.NEXT_PUBLIC_API_URL, {
                    transports: ['websocket', 'polling'], // Allow both
                    reconnection: true,
                    reconnectionAttempts: 5
                });

                socketRef.current.on(`notification_${parsedUser.id}`, (data: any) => {
                    fetchNotifications();
                    setActiveToast({
                        title: data.type === "MESSAGE" ? "New Message" : "New Update",
                        description: "You have a new notification."
                    });
                    setTimeout(() => setActiveToast(null), 5000);
                });
            }
            fetchedRef.current = true;
        }

        const interval = setInterval(fetchNotifications, 60000);

        return () => {
            clearInterval(interval);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            fetchedRef.current = false;
        };
    }, []); // Empty dependency array for stability

    // Close notifications on route change
    useEffect(() => {
        setShowNotifications(false);
    }, [pathname]);

    const fetchNotifications = async () => {
        try {
            const response = await apiFetch("/api/users/notifications");

            if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const data = await response.json();
                    if (data.success) {
                        setNotifications(data.notifications);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markRead = async (id: string) => {
        try {
            await apiFetch(`/api/users/notifications/${id}`, {
                method: "PUT"
            });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking read:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/");
    };

    if (!user) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const filteredNavItems = navItems.filter(
        (item) => !item.role || item.role === user.role
    );

    return (
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#020617] relative overflow-hidden transition-colors duration-500">
            {/* Dark Aura Background Effects */}
            <div className={`absolute top-0 right-0 h-[500px] w-[500px] blur-[120px] rounded-full opacity-20 dark:opacity-30 transition-all duration-1000 -translate-y-1/2 translate-x-1/4 pointer-events-none ${user.role === 'INVESTOR' ? 'bg-indigo-600' : 'bg-emerald-500'}`} />
            <div className={`absolute bottom-0 left-0 h-[300px] w-[300px] blur-[100px] rounded-full opacity-10 dark:opacity-20 transition-all duration-1000 translate-y-1/4 -translate-x-1/4 pointer-events-none ${user.role === 'INVESTOR' ? 'bg-purple-600' : 'bg-indigo-500'}`} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
                                <Rocket className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Startup Connect</span>
                        </Link>
                    </div>

                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-1 py-4">
                            {filteredNavItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : ""}`}>
                <header className="sticky top-0 z-40 bg-white/60 dark:bg-[#020617]/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 px-4 sm:px-6 lg:px-8 shadow-sm">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 bg-white/50 dark:bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800/60 group focus-within:ring-2 focus-within:ring-indigo-100 transition-all shadow-sm">
                                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none focus:outline-none w-48 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    // Let globalSearch just act visually or redirect, Cmd+K normally handles the overlay
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && globalSearch.trim()) {
                                            router.push(`/dashboard/discover?q=${encodeURIComponent(globalSearch.trim())}`);
                                            setGlobalSearch("");
                                        }
                                    }}
                                />
                                <kbd className="hidden lg:inline-flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-2">
                                    ⌘K
                                </kbd>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4">
                            <ThemeToggle />
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative text-slate-500 hover:bg-slate-100 rounded-xl"
                                    onClick={() => setShowNotifications(!showNotifications)}
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-indigo-600 text-[10px] text-white flex items-center justify-center border-2 border-white font-bold">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Button>

                                {showNotifications && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-300">
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white text-slate-900">
                                            <h4 className="font-bold">Notifications</h4>
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold">{unreadCount} New</Badge>
                                        </div>
                                        <ScrollArea className="max-h-96">
                                            {notifications.length > 0 ? (
                                                <div className="divide-y divide-slate-50">
                                                    {notifications.map((n) => (
                                                        <div
                                                            key={n._id}
                                                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-indigo-50/20' : ''}`}
                                                            onClick={() => markRead(n._id)}
                                                        >
                                                            <div className="flex items-start gap-3">
                                                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.isRead ? 'bg-indigo-600' : 'bg-transparent'}`} />
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                                                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                                                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <BellOff className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                                                    <p className="text-sm text-slate-500 font-medium">No updates yet.</p>
                                                </div>
                                            )}
                                        </ScrollArea>
                                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                                            <Button variant="ghost" size="sm" className="w-full text-xs text-indigo-600 font-bold hover:text-indigo-700">
                                                View all notifications
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-slate-900 uppercase">{user.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100 ring-2 ring-white">
                                    {user.name?.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    {user?.isProfileCompleted ? children : (
                        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                            <p className="text-slate-500 animate-pulse">Checking profile status...</p>
                        </div>
                    )}
                </div>

                {/* Command Palette Mount */}
                <CommandPalette />

                {/* Real-time Toast Notification (5 seconds) */}
                {activeToast && (
                    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-right-10 duration-500">
                        <Card className="bg-indigo-600 text-white border-none shadow-2xl p-4 flex items-center gap-4 min-w-[300px]">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold">{activeToast.title}</p>
                                <p className="text-xs opacity-90">{activeToast.description}</p>
                            </div>
                            <button onClick={() => setActiveToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">
                                <X className="h-4 w-4" />
                            </button>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
