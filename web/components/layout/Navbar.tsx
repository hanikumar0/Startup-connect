"use client";

import { useAuthStore } from "@/lib/store";
import { 
  Bell, 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  MessageSquare,
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
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <nav className="h-16 px-6 flex items-center justify-between w-full">
      <div className="flex-1 hidden md:flex" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/messages">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 transition-colors">
                <MessageSquare className="h-4 w-4" />
            </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-900 transition-colors relative">
            <div className="absolute top-2.5 right-2 h-1.5 w-1.5 rounded-full bg-primary border border-white" />
            <Bell className="h-4 w-4" />
        </Button>

        <div className="h-6 w-px bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative p-0 h-9 hover:bg-transparent flex items-center gap-2 group focus-visible:ring-0">
              <Avatar className="h-8 w-8 rounded-full border border-border">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-slate-100 text-slate-600 font-medium text-xs">
                  {user?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left">
                <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || 'User'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2" align="end">
            <div className="px-2 py-2">
              <p className="text-xs font-medium text-slate-500">Signed in as</p>
              <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="flex items-center gap-2 w-full">
                <User className="h-4 w-4 text-slate-500" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex items-center gap-2 w-full">
                <Settings className="h-4 w-4 text-slate-500" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
               onClick={logout} 
               className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
