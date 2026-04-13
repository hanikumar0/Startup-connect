"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const GLOBAL_WS_KEY = "_vdr_global_socket";

export const initSocket = (token: string, userId: string) => {
    // 1. Survival Layer: Check local module OR global window (persists across HMR/Turbo)
    if (!socket && typeof window !== "undefined") {
        socket = (window as any)[GLOBAL_WS_KEY] || null;
    }

    if (socket && (socket as any)._last_token === token) {
        if (!socket.connected) {
            socket.connect();
        }
        return socket;
    }

    // 2. Token Swap: Only disconnect if the AUTH changed
    if (socket) {
        console.log("🔄 [Socket] Auth Changed - Closing Old Connection...");
        socket.disconnect();
        socket = null;
        if (typeof window !== "undefined") (window as any)[GLOBAL_WS_KEY] = null;
    }

    console.log("🌐 [Socket] Initializing Pure WebSocket Singleton...");
    // Using both auth (token) and query (userId) for maximum reliability mapping
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
        autoConnect: false,
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 5000,
        auth: { token },
        query: { userId }, // Explicitly pass userId from store
        withCredentials: true,
        upgrade: false 
    });

    (socket as any)._last_token = token;

    socket.on("connect", () => {
        console.log("✅ [Socket] Global Connection Ready:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
        console.warn("⚠️ [Socket] Global Disconnect:", reason);
    });

    if (typeof window !== "undefined") {
        (window as any)[GLOBAL_WS_KEY] = socket;
    }

    socket.connect();
    return socket;
};

/**
 * Retrieve Global Singleton
 */
export const getSocket = () => {
    if (!socket) {
        // Log warning instead of throwing if we haven't reached the auth-guarded layouts yet
        console.warn("⚠️ [Socket] getSocket called before initSocket.");
        return null; 
    }
    return socket;
};

/**
 * Explicit Cleanup on Logout
 */
export const disconnectSocket = () => {
    if (socket) {
        console.log("🔌 [Socket] Manual Global Disconnect (Logout)");
        socket.disconnect();
        socket = null;
    }
};
