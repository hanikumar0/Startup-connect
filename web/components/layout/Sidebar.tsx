"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Search, 
  Target,
  Users,
  MessageSquare, 
  Calendar, 
  Bookmark, 
  User, 
  ShieldCheck,
  Bell,
  LogOut,
  Zap,
  Sparkles,
  TrendingUp,
  Trophy,
  ChevronDown,
  Settings,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState<string | null>("Main");

  // Auto-expand section based on current path
  useEffect(() => {
    const findSection = () => {
      for (const section of navigation) {
        if (section.items.some(item => pathname === item.href)) {
          setExpandedSection(section.title);
          break;
        }
      }
    };
    findSection();
  }, [pathname]);

  const navigation = [
    {
      title: "Main",
      icon: LayoutDashboard,
      items: [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "Discover", href: "/dashboard/discover", icon: Search },
        { label: "AI Match Score", href: "/dashboard/matches", icon: Sparkles },
        { label: "Raise Tracker", href: "/dashboard/raise", icon: TrendingUp },
      ]
    },
    {
      title: "Network",
      icon: Users,
      items: [
        { label: "Connections", href: "/dashboard/network", icon: Users },
        { label: "Messages", href: "/dashboard/chat", icon: MessageSquare },
        { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
        { label: "CRM", href: "/dashboard/crm", icon: Target },
      ]
    },
    {
      title: "Growth",
      icon: TrendingUp,
      items: [
        { label: "Grants & Programs", href: "/dashboard/grants", icon: Trophy },
        { label: "Market Intel", href: "/dashboard/intelligence", icon: Sparkles },
        { label: "Smart Alerts", href: "/dashboard/alerts", icon: Bell },
      ]
    },
    {
      title: "Assets",
      icon: ShieldCheck,
      items: [
        { label: "Data Rooms", href: "/dashboard/vdr", icon: ShieldCheck },
        { label: "Saved", href: "/dashboard/saved", icon: Bookmark },
        { label: "Pitch Deck Analyzer", href: "/dashboard/analyzer", icon: FileText },
      ]
    },
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Profile", href: "/dashboard/settings/profile", icon: User },
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  return (
    <div className="flex h-full w-[260px] flex-col bg-white border-r border-slate-100 shrink-0">
      
      {/* Brand logo */}
      <div className="px-7 py-8">
        <Link href="/dashboard" className="flex items-center gap-3">
           <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
             <Zap size={18} fill="currentColor" />
           </div>
           <span className="text-xl font-black text-slate-900 tracking-tight">Startup Connect</span>
        </Link>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 px-4 py-2 overflow-y-auto no-scrollbar space-y-2">
        {navigation.map((section) => {
          const isExpanded = expandedSection === section.title;
          const hasActiveItem = section.items.some(item => pathname === item.href);

          return (
            <div key={section.title} className="space-y-1">
              <button
                onClick={() => toggleSection(section.title)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                  hasActiveItem ? "bg-slate-50/80" : "hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <section.icon className={cn(
                    "h-4.5 w-4.5 transition-colors",
                    hasActiveItem ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest transition-colors",
                    hasActiveItem ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                  )}>
                    {section.title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5",
                    hasActiveItem ? "text-indigo-400" : "text-slate-300"
                  )} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 pr-2 py-1 space-y-1">
                      {section.items.map((item) => {
                        const active = pathname === item.href;
                        return (
                          <Link 
                            key={item.label} 
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all",
                              active 
                                ? "text-indigo-600 bg-indigo-50/50" 
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                            )}
                          >
                            <item.icon className={cn("h-4 w-4", active ? "text-indigo-600" : "text-slate-300")} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Profile Card at bottom */}
      <div className="p-4 border-t border-slate-50">
        <div 
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm mb-2 cursor-pointer hover:border-indigo-100 transition-all overflow-hidden group"
          onClick={() => router.push("/dashboard/settings/profile")}
        >
           <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-[10px] font-black shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-all">
              {user?.avatar ? (
                <img src={user.avatar} className="h-full w-full rounded-full object-cover" alt="Profile" />
              ) : (
                user?.name?.charAt(0) || "R"
              )}
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
