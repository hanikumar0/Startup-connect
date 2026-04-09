import { Server } from "socket.io";
import Conversation from "./models/Conversation.js";
import Message from "./models/Message.js";
import User from "./models/User.js";
import { createNotification } from "./services/notificationService.js";

let io;

const setupSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", 
            methods: ["GET", "POST"]
        },
        transports: ["websocket"], // Force websockets, avoids polling downgrade bugs
        pingTimeout: 60000,
        pingInterval: 25000
    });

    const userSockets = new Map();

    io.on("connection", (socket) => {
        console.log(`📡 [Socket.io] New connection established: ${socket.id}`);

        socket.on("auth", (userId) => {
            console.log(`🔐 [Socket.io] User ${userId} authenticated on socket ${socket.id}`);
            userSockets.set(userId, socket.id);
            socket.join(userId.toString());
        });

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
        });

        socket.on("send_message", async (data) => {
            const { conversationId, senderId, text } = data;

            try {
                const message = await Message.create(data);
                const sender = await User.findById(senderId);

                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: { text: text || "Attachment", senderId, at: new Date() }
                });

                io.to(conversationId).emit("receive_message", message);

                const conversation = await Conversation.findById(conversationId);
                for (const participantId of conversation.participants) {
                    if (participantId.toString() !== senderId.toString()) {
                        // 1. Emit live alert
                        io.to(participantId.toString()).emit("new_message_alert", { conversationId, message });

                        // 2. Create Persistent Notification
                        await createNotification({
                            userId: participantId,
                            type: "new_message",
                            title: `New Message from ${sender.name}`,
                            message: text ? (text.length > 50 ? text.substring(0, 50) + "..." : text) : "sent an attachment",
                            link: `/messages`
                        });
                    }
                }

            } catch (error) {
                console.error("Socket error:", error);
            }
        });

        socket.on("disconnect", (reason) => {
            console.log(`🔌 [Socket.io] Disconnected: ${socket.id} | Reason: ${reason}`);
            // Cleanup memory to prevent leaks
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
        });
    });

    return io;
};

export const getIO = () => io;
export default setupSocket;
