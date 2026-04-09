import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";

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
        pingInterval: 25000
    });

    // Socket Authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
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

        if (socket.userId) {
            socket.join(socket.userId);
        }

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        });

        socket.on("send_message", async (data) => {
            const { conversationId, senderId, text, attachments, messageType } = data;

            try {
                const message = await Message.create({
                    conversationId,
                    senderId,
                    text,
                    attachments,
                    messageType
                });

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: {
                        text: text || (attachments?.length > 0 ? "Sent a file" : "Meeting Request"),
                        senderId,
                        at: new Date()
                    }
                });

                // Broadcast to conversation room
                io.to(conversationId).emit("receive_message", message);

                // Notify other participants via their personal rooms
                const conversation = await Conversation.findById(conversationId);
                conversation.participants.forEach(pId => {
                    const participantId = pId.toString();
                    if (participantId !== senderId) {
                        io.to(participantId).emit("new_message_alert", {
                            conversationId,
                            message
                        });
                    }
                });

            } catch (error) {
                console.error("❌ Send message error:", error.message);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        socket.on("typing", ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit("user_typing", { 
                senderId: socket.userId, 
                isTyping 
            });
        });

        socket.on("disconnect", (reason) => {
            console.log(`👋 User disconnected: ${socket.id} (Disconnected بسبب: ${reason})`);
        });
    });

    return io;
};

export default setupSockets;
