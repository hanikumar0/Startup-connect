import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const setupSockets = (server) => {
    const isProduction = process.env.NODE_ENV === "production";
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
    ].filter(Boolean);

    const io = new Server(server, {
        cors: {
            origin: isProduction ? allowedOrigins : "*",
            methods: ["GET", "POST", "OPTIONS"],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000,
    });

    // ─── Socket Authentication Middleware ───
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;

        if (!token) {
            // Allow unauthenticated connections in development
            if (!isProduction) return next();
            return next(new Error("Authentication required"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            if (!isProduction) return next();
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.id} (userId: ${socket.userId || "anonymous"})`);

        // Join user's personal notification room
        if (socket.userId) {
            socket.join(`user_${socket.userId}`);
        }

        // User joins a private room based on conversationId
        socket.on("join_room", (conversationId) => {
            if (!conversationId || typeof conversationId !== "string") return;
            socket.join(conversationId);
        });

        // Handle sending messages
        socket.on("send_message", async (data) => {
            const { conversationId, senderId, receiverId, text } = data;

            if (!conversationId || !senderId || !receiverId || !text) {
                socket.emit("error", { message: "Missing required message fields" });
                return;
            }

            // Sanitize text input (basic XSS prevention)
            const sanitizedText = text
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .slice(0, 5000); // Max message length

            try {
                const newMessage = await Message.create({
                    conversationId,
                    senderId,
                    receiverId,
                    text: sanitizedText,
                });

                io.to(conversationId).emit("receive_message", newMessage);

                // Create notification for receiver
                try {
                    const sender = await User.findById(senderId).lean();
                    if (sender) {
                        await Notification.create({
                            recipient: receiverId,
                            sender: senderId,
                            type: "MESSAGE",
                            title: `New Message from ${sender.name}`,
                            message: sanitizedText.length > 50 ? sanitizedText.substring(0, 50) + "..." : sanitizedText,
                            link: "/dashboard/chat"
                        });

                        // Emit to receiver's personal room
                        io.to(`user_${receiverId}`).emit("new_notification", { type: "MESSAGE" });
                    }
                } catch (notifErr) {
                    console.warn("Notification creation failed:", notifErr.message);
                }
            } catch (error) {
                console.error("❌ Error saving message:", error.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Mark messages as read
        socket.on("mark_messages_read", async ({ conversationId, userId }) => {
            try {
                await Message.updateMany(
                    { conversationId, receiverId: userId, isRead: false },
                    { isRead: true }
                );
                io.to(conversationId).emit("messages_marked_read", { conversationId, userId });
            } catch (error) {
                console.error("Error marking read:", error.message);
            }
        });

        // Typing Indicators
        socket.on("typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("user_typing", { userId });
        });

        socket.on("stop_typing", ({ conversationId, userId }) => {
            socket.to(conversationId).emit("user_stop_typing", { userId });
        });

        // --- WebRTC Signaling ---
        socket.on("call_user", (data) => {
            io.to(data.to).emit("call_made", {
                offer: data.offer,
                socket: socket.id,
                from: data.from,
                roomId: data.roomId
            });
        });

        socket.on("make_answer", (data) => {
            io.to(data.to).emit("answer_made", {
                socket: socket.id,
                answer: data.answer
            });
        });

        socket.on("ice_candidate", (data) => {
            io.to(data.to).emit("ice_candidate", {
                candidate: data.candidate,
                socket: socket.id
            });
        });

        socket.on("disconnect", () => {
            console.log(`👋 User disconnected: ${socket.id}`);
        });

        socket.on("error", (error) => {
            console.error(`Socket error for ${socket.id}:`, error.message);
        });
    });

    return io;
};

export default setupSockets;
