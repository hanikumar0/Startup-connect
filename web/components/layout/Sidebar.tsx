"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  Calendar, 
  Bookmark, 
  User, 
  ShieldCheck,
  Lock,
  Bell,
  CreditCard,
  LogOut,
  Zap
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const isNavItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/startup/dashboard" || pathname === "/investor/dashboard" || pathname === "/admin/dashboard";
    }
    return pathname.startsWith(href);
  };

  const mainNavItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Discover", href: "/discover", icon: Search },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Meetings", href: "/meetings", icon: Calendar },
    { label: "Saved", href: "/saved", icon: Bookmark },
  ];

  const settingsItems = [
    { label: "Profile", href: "/settings?tab=profile", icon: User },
    { label: "Verification", href: "/settings?tab=verification", icon: ShieldCheck },
    { label: "Security", href: "/settings?tab=security", icon: Lock },
    { label: "Notifications", href: "/settings?tab=notifications", icon: Bell },
    { label: "Billing", href: "/settings?tab=billing", icon: CreditCard },
  ];

  return (
    <div className="flex h-full w-[260px] flex-col bg-white border-r border-border">
      
      {/* Brand logo */}
      <div className="px-6 py-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
           <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
             <Zap size={18} fill="currentColor" />
           </div>
           <span className="text-base font-semibold text-slate-900 tracking-tight">Startup Connect</span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const active = isNavItemActive(item.href);
            let finalHref = item.href;
            if (item.href === "/dashboard" && user?.role) {
                finalHref = `/${user.role}/dashboard`;
            } else if (item.href === "/discover" && user?.role) {
                finalHref = user.role === "startup" ? "/discover/investors" : "/discover/startups";
            }

            return (
              <Link 
                key={item.label} 
                href={finalHref}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active 
                    ? "bg-slate-100/80 text-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("h-4 w-4", active ? "text-primary" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="h-px bg-border my-6" />

        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Settings</p>
          {settingsItems.map((item) => {
            // Using a simple query param check or pathname check for demo purposes
            // In a real app we might want a stricter check
            const active = pathname.includes(item.href.split('?')[0]); 
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active && pathname.includes('settings') // rudimentary check mostly relying on exact path matching
                    ? "bg-slate-100/80 text-slate-900" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <item.icon className={cn("h-4 w-4", active && pathname.includes('settings') ? "text-primary" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border shadow-sm mb-2">
           <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-medium text-xs">
              {user?.name?.charAt(0) || "U"}
           </div>
           <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-900 truncate leading-none">{user?.name || "User"}</p>
              <p className="text-xs text-slate-500 truncate mt-1 capitalize">{user?.role || "founder"}</p>
           </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <span>Log out</span>
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
