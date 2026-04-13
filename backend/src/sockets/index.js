import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Connection from "../models/Connection.js";

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
        transports: ["websocket"], // FORCE Websocket Only to avoid "transport close" polling upgrades
        pingTimeout: 120000,       // Increase to 2 minutes
        pingInterval: 30000,
        allowEIO3: true
    });

    console.log("🏁 [Socket.io] Server initialized with WebSocket & Polling support");

    // Socket Authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        console.log(`🔑 [Socket.io] Auth attempt for socket ${socket.id} | Token present: ${!!token}`);
        
        if (!token) {
            if (!isProduction) {
                console.log("⚠️ [Socket.io] No token, but allowing in development mode");
                return next();
            }
            return next(new Error("Authentication required"));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            console.error(`❌ [Socket.io] JWT Verification failed: ${err.message}`);
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

        socket.on("join", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`[Socket] Manual join for userId: ${userId}`);
            }
        });

        socket.on("sendMessage", async (data) => {
            console.log("---- SOCKET START ----");
            const { conversationId, senderId, receiverId, text, attachments, messageType } = data;
            
            console.log(`🔌 [Socket] Incoming message from: ${senderId}`);
            console.log(`🔌 [Socket] Targeted for: ${receiverId}`);
            console.log(`🔌 [Socket] Type: ${messageType || "text"}`);

            try {
                if (!conversationId || !senderId || !receiverId) {
                    console.error("❌ [Socket] Blocked: Missing required session IDs");
                    return;
                }

                // CONNECTION CHECK LOGIC
                const connection = await Connection.findOne({
                    $or: [
                        { sender: senderId, recipient: receiverId },
                        { sender: receiverId, recipient: senderId }
                    ],
                    status: "ACCEPTED"
                });

                if (connection?.status !== "ACCEPTED") {
                    console.warn(`❌ [Socket] Blocked: Users are not connected. Status: ${connection?.status || 'not found'}`);
                    return socket.emit("error", { message: "Messaging blocked. Connection required." });
                }

                console.log("✅ [Socket] Connection Validated (ACCEPTED)");

                // Prepare message object
                const message = {
                    ...data,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };

                // Broadcast to conversation room (so other participants see it, excluding sender)
                socket.to(conversationId).emit("receiveMessage", message);
                
                // INSTANT DELIVERY VIA PERSONAL ROOM (for receiver)
                console.log(`📤 [Socket] Emitting to personal room: ${receiverId}`);
                io.to(receiverId).emit("receiveMessage", message);
                
                // ALSO trigger alert for notifications
                io.to(receiverId).emit("new_message_alert", {
                    conversationId,
                    message
                });

                console.log("✅ [Socket] Message broadcast successfully");
                console.log("---- SOCKET END ----");

                // ALSO trigger alert for notifications
                io.to(receiverId).emit("new_message_alert", {
                    conversationId,
                    message
                });

                console.log("[Socket] Message delivered instantly");
                console.log("---- SOCKET END ----");

            } catch (error) {
                console.error("[Message Socket Error]", error.message);
                socket.emit("error", { message: "Failed to broadcast message" });
            }
        });

        socket.on("mark_messages_read", async ({ conversationId, userId }) => {
            try {
                await Message.updateMany(
                    { conversationId, senderId: { $ne: userId }, isRead: false },
                    { isRead: true }
                );
                io.to(conversationId).emit("messages_marked_read", { conversationId });
                console.log(`[Socket] Messages marked read by ${userId} in conversation ${conversationId}`);
            } catch (error) {
                console.error("[Read Marker Error]", error.message);
            }
        });

        socket.on("typing", ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit("user_typing", { 
                senderId: socket.userId, 
                isTyping 
            });
            if (isTyping) {
                console.log(`[Socket] Typing pulse: User ${socket.userId} in room ${conversationId}`);
            }
        });

        socket.on("edit_message", ({ conversationId, messageId, text }) => {
            console.log(`✏️ [Socket] Message edited: ${messageId}`);
            io.to(conversationId).emit("message_edited", { messageId, text });
        });

        socket.on("delete_for_both", ({ conversationId, messageId }) => {
            console.log(`🔥 [Socket] Message deleted for both: ${messageId}`);
            io.to(conversationId).emit("message_deleted_for_both", { messageId });
        });

        socket.on("add_reaction", async ({ conversationId, messageId, emoji, userId }) => {
            try {
                const message = await Message.findById(messageId);
                if (!message) return;

                // Remove previous reaction from same user (if any)
                message.reactions = message.reactions.filter(
                    (r) => r.userId.toString() !== userId.toString()
                );

                // Add new reaction
                message.reactions.push({ userId, emoji });

                await message.save();

                console.log(`😊 [Socket] Reaction added to msg ${messageId}: ${emoji}`);
                io.to(conversationId).emit("reaction_updated", {
                    messageId,
                    reactions: message.reactions,
                });
            } catch (error) {
                console.error("❌ [Socket] Reaction Failed:", error.message);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`👋 User disconnected: ${socket.id} (Disconnected بسبب: ${reason})`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        // This might happen if called before server.listen
        return null;
    }
    return io;
};

export default setupSockets;
