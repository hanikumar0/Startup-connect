import { Server } from "socket.io";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const setupSockets = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // In production, specify the web and mobile origins
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`🔌 User connected: ${socket.id}`);

        // User joins a private room based on conversationId
        socket.on("join_room", (conversationId) => {
            socket.join(conversationId);
            console.log(`👤 User joined room: ${conversationId}`);
        });

        // Handle sending messages
        socket.on("send_message", async (data) => {
            const { conversationId, senderId, receiverId, text } = data;

            try {
                // Save to Database
                const newMessage = await Message.create({
                    conversationId,
                    senderId,
                    receiverId,
                    text,
                });

                // Broadcast to the room
                io.to(conversationId).emit("receive_message", newMessage);

                // Create a persistent notification for the receiver
                const sender = await User.findById(senderId);
                await Notification.create({
                    recipient: receiverId,
                    sender: senderId,
                    type: "MESSAGE",
                    title: `New Message from ${sender.name}`,
                    message: text.length > 50 ? text.substring(0, 50) + "..." : text,
                    link: "/dashboard/chat"
                });

                // Emit event to update notification bell in real-time
                io.emit(`notification_${receiverId}`, { type: "MESSAGE" });

            } catch (error) {
                console.error("❌ Error saving message:", error);
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
                console.error("Error marking read:", error);
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
            // data: { offer, to, from, roomId }
            io.to(data.to).emit("call_made", {
                offer: data.offer,
                socket: socket.id,
                from: data.from,
                roomId: data.roomId
            });
        });

        socket.on("make_answer", (data) => {
            // data: { answer, to }
            io.to(data.to).emit("answer_made", {
                socket: socket.id,
                answer: data.answer
            });
        });

        socket.on("ice_candidate", (data) => {
            // data: { candidate, to }
            io.to(data.to).emit("ice_candidate", {
                candidate: data.candidate,
                socket: socket.id
            });
        });

        socket.on("disconnect", () => {
            console.log(`👋 User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default setupSockets;
