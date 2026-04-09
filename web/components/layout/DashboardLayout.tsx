"use client";

import { useAuthStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!_hasHydrated) return;
    
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, _hasHydrated, router]);

  if (!mounted || loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background font-sans">
         <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-sans">
      {/* Desktop Sidebar Container */}
      <aside className="hidden lg:flex lg:sticky lg:top-0 lg:h-screen lg:shrink-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-xl"
            >
              <Sidebar />
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-4 -right-12 h-10 w-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-md hover:text-slate-900 transition-colors"
              >
                  <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 relative z-10 w-full min-w-0">
        <div className="sticky top-0 z-30 flex items-center gap-4 lg:gap-0 bg-white border-b border-border px-4 lg:px-0">
           <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden h-10 w-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md transition-colors ml-2"
            >
              <Menu className="h-5 w-5" />
           </button>
           <div className="flex-1">
                <Navbar />
           </div>
        </div>

        <main className="flex-1 w-full max-w-[1200px] mx-auto p-6 md:p-8">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
        </main>
      </div>
    </div>
  );
}
