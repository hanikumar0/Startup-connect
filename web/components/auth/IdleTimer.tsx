"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { disconnectSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

/**
 * STEP 1 — DEFINE IDLE TIME
 * Inactivity threshold: 5 minutes
 * Warning threshold: 4 minutes
 */
const IDLE_TIMEOUT = 5 * 60 * 1000; 
const WARNING_TIMEOUT = 4 * 60 * 1000;

export default function IdleTimer() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // STEP 3 — LOGOUT FUNCTION
  const logoutUser = () => {
    console.log("User idle — logging out");
    
    // Clear State
    logout();
    
    // STEP 5 — SOCKET DISCONNECT
    disconnectSocket();
    
    // Remove individual tokens for safety
    localStorage.removeItem("token");
    localStorage.removeItem("auth-storage");
    
    toast.info("Session expired due to inactivity");
    
    // Redirect
    window.location.href = "/login";
  };

  // STEP 2 — TRACK USER ACTIVITY & RESET TIMER
  const resetTimer = () => {
    if (!user) return;

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // STEP 6 — OPTIONAL WARNING (After 4 minutes)
    warningTimerRef.current = setTimeout(() => {
        if (pathname !== "/login") {
            toast.warning("Session expiring soon", {
                description: "You will be automatically logged out in 60 seconds unless you interact with the app.",
                duration: 10000,
            });
        }
    }, WARNING_TIMEOUT);

    // Logout Timer (5 minutes)
    idleTimerRef.current = setTimeout(() => {
      logoutUser();
    }, IDLE_TIMEOUT);
  };

  useEffect(() => {
    // Only track if user is authenticated and not on auth pages
    const isAuthPage = ["/login", "/register", "/"].includes(pathname);
    if (!user || isAuthPage) return;

    // STEP 2 — TRACK ACTIVITY: mousemove, keydown, click, scroll
    const events = ["mousemove", "keydown", "click", "scroll"];
    
    // STEP 4 — START TIMER
    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, pathname]);

  return null;
}
