import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (token: string) => {
    if (socket) {
        return socket;
    }

    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
        auth: { token },
        transports: ["websocket", "polling"], // Re-enable polling fallback for compatibility
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 20000,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("⚠️ Socket connection error:", error.message);
    });

    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
