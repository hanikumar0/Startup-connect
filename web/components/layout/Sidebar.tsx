"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Search, 
  Users,
  MessageSquare, 
  Calendar, 
  Bookmark, 
  User, 
  ShieldCheck,
  Lock,
  Bell,
  LogOut,
  Zap
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const mainNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Discover", href: "/dashboard/discover", icon: Search },
    { label: "Connections", href: "/dashboard/network", icon: Users },
    { label: "Messages", href: "/dashboard/chat", icon: MessageSquare },
    { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
    { label: "Saved", href: "/dashboard/saved", icon: Bookmark },
  ];

  const settingsItems = [
    { label: "Profile", href: "/dashboard/settings/profile", icon: User },
    { label: "Verification", href: "/dashboard/settings/verification", icon: ShieldCheck },
    { label: "Security", href: "/dashboard/settings/security", icon: Lock },
    { label: "Notifications", href: "/dashboard/settings/notifications", icon: Bell },
  ];

  return (
    <div className="flex h-full w-[240px] flex-col bg-white border-r border-slate-100 shrink-0">
      
      {/* Brand logo */}
      <div className="px-7 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
             <Zap size={16} fill="currentColor" />
           </div>
           <span className="text-lg font-black text-slate-900 tracking-tight">Startup Connect</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-2 space-y-6 overflow-y-auto no-scrollbar">
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                  active 
                    ? "bg-slate-50 text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                )}
              >
                <item.icon className={cn("h-4.5 w-4.5", active ? "text-indigo-600 font-black" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-50 space-y-1">
          <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 mb-3 opacity-70">Settings</p>
          {settingsItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all",
                  active 
                    ? "bg-slate-50 text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                )}
              >
                <item.icon className={cn("h-4.5 w-4.5", active ? "text-indigo-600 font-black" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Profile Card at bottom - Replicated from Image */}
      <div className="p-4 border-t border-slate-50">
        <div 
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm mb-2 cursor-pointer hover:border-indigo-100 transition-all overflow-hidden group"
          onClick={() => router.push("/dashboard/settings/profile")}
        >
           <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-black shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
              {user?.avatar ? <img src={user.avatar} className="h-full w-full rounded-full object-cover" /> : (user?.name?.charAt(0) || "R")}
           </div>
           <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-black text-slate-900 truncate leading-tight">{user?.name || "Rahul Mehta"}</p>
              <p className="text-[10px] font-bold text-slate-400 truncate opacity-70 capitalize">{user?.role || "Investor"}</p>
           </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
        >
          <LogOut size={14} className="opacity-50" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
}
