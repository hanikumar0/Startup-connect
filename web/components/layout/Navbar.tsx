"use client";

import { useAuthStore } from "@/lib/store";
import { 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  MessageSquare,
  Search,
  Command,
  HelpCircle,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { motion } from "framer-motion";
import NotificationDropdown from "@/components/notifications/NotificationDropdown";

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="h-full flex items-center justify-between w-full">
      {/* Global Command Center Search */}
      <div className="flex-1 hidden md:flex max-w-md">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Neural Search (Cmd + K)"
            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-[18px] pl-12 pr-12 text-xs font-bold italic focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all placeholder:text-slate-300"
          />
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <div className="px-1.5 py-0.5 bg-white border border-slate-100 rounded-md text-[9px] font-black text-slate-400 uppercase tracking-tighter shadow-sm flex items-center gap-1">
              <Command size={8} /> K
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-1 mr-4">
           <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 transition-all rounded-2xl group">
                <HelpCircle className="h-5 w-5 group-hover:rotate-12 transition-transform" />
           </Button>
           <Link href="/dashboard/chat">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 transition-all rounded-2xl group relative">
                  <div className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                  <MessageSquare className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
              </Button>
           </Link>
           {/* Live Notification Dropdown */}
           <NotificationDropdown />
        </div>

        <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-[22px] border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-300 group focus-visible:outline-none bg-white shadow-sm"
            >
              <Avatar className="h-9 w-9 rounded-2xl border-2 border-white shadow-md">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-slate-900 text-white font-black text-[10px] uppercase">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <p className="text-[11px] font-black text-slate-900 tracking-tight uppercase leading-none mb-1 italic">{user?.name || 'User'}</p>
                <p className="text-[9px] font-black text-indigo-500/60 uppercase tracking-widest leading-none">CORE_ENTITY</p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-300 group-hover:text-slate-900 transition-colors ml-1" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mt-4 p-3 rounded-[32px] border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-3xl bg-white/90" align="end">
            <div className="px-4 py-4 mb-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Authenticated Account</p>
              <p className="text-sm font-black text-slate-900 truncate italic">{user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-slate-50 mb-2" />
            <DropdownMenuItem asChild className="cursor-pointer rounded-2xl py-3 px-4 focus:bg-slate-50 transition-colors">
              <Link href="/settings?tab=profile" className="flex items-center justify-between w-full group">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 italic">User Profile</span>
                </div>
                <ArrowUpRight size={12} className="text-slate-300" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer rounded-2xl py-3 px-4 focus:bg-slate-50 transition-colors">
              <Link href="/settings" className="flex items-center justify-between w-full group">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 italic">System Nodes</span>
                </div>
                <ArrowUpRight size={12} className="text-slate-300" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-50 my-2" />
            <DropdownMenuItem 
               onClick={logout} 
               className="cursor-pointer flex items-center gap-3 rounded-2xl py-3 px-4 text-red-500 focus:text-red-600 focus:bg-red-50 transition-all font-black uppercase tracking-[0.1em] text-[10px] italic"
            >
              <LogOut className="h-4 w-4" />
              <span>Terminate Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}

const ArrowUpRight = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
    </svg>
);
