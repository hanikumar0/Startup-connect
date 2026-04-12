"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Rocket, 
  Wallet, 
  Key, 
  Terminal, 
  Mail, 
  CreditCard, 
  AlertTriangle, 
  BarChart3,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!token) {
      router.push("/login");
      return;
    }

    if (user && user.role?.toUpperCase() !== "ADMIN") {
      toast.error("Access Deprioritized: Administrative Credentials Required");
      router.push("/dashboard");
    }
  }, [_hasHydrated, token, user, router]);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Startups", icon: Rocket, path: "/admin/startups" },
    { name: "Investors", icon: Wallet, path: "/admin/investors" },
    { name: "Claims", icon: Key, path: "/admin/claims" },
    { name: "Scrapers", icon: Terminal, path: "/admin/scrapers" },
    { name: "Outreach", icon: Mail, path: "/admin/outreach" },
    { name: "Subscriptions", icon: CreditCard, path: "/admin/subscriptions" },
    { name: "Reports", icon: AlertTriangle, path: "/admin/reports" },
    { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
  ];

  const handleLogout = () => {
    const { disconnectSocket } = require("@/lib/socket");
    disconnectSocket();
    logout();
    toast.success("Admin logged out");
    router.push("/login");
  };

  if (!_hasHydrated || !user || user.role?.toUpperCase() !== "ADMIN") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 bg-slate-900 rounded-xl animate-pulse" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Synchronizing Governance node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200/60 sticky top-0 h-screen flex flex-col shadow-[20px_0_40px_-15px_rgba(0,0,0,0.02)]">
        <div className="p-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <ShieldCheck size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">SC ADMIN</h1>
          </div>
          <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
             <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
             Governance System v1.1
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center justify-between px-4 h-14 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                    : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-900"} />
                  <span className={`text-sm font-bold tracking-tight ${isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"}`}>
                    {item.name}
                  </span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-indicator">
                    <ChevronRight size={14} className="text-indigo-400" />
                  </motion.div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 h-14 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold group"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {/* Dynamic Background */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-50/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 -z-10" />
        
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
