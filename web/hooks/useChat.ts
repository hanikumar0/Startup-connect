"use client";

import { useEffect, useRef, useState } from "react";
import { initSocket, getSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store";

export default function useChat(conversationId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) return;

    // Utilize singleton socket instance
    const socket = initSocket(token);
    socketRef.current = socket;

    if (user?.id) {
        socket.emit("auth", user.id);
    }

    const messageHandler = (message: any) => {
        setMessages((prev) => [...prev, message]);
    };

    const typingHandler = (data: any) => {
        if (data.senderId !== user?.id) {
            setIsTyping(data.isTyping);
        }
    };

    socket.on("receive_message", messageHandler);
    socket.on("user_typing", typingHandler);

    return () => {
        // Clean up listeners on unmount (do NOT disconnect the singleton socket here)
        socket.off("receive_message", messageHandler);
        socket.off("user_typing", typingHandler);
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (conversationId && socketRef.current) {
        socketRef.current.emit("join_conversation", conversationId);
        // Clear previous messages? Actually better to re-set when switching if you have 
        // a messages state in the Hook that corresponds to the Active Chat.
    }
  }, [conversationId]);

  const sendMessage = (text: string, attachments: any[] = [], type: string = "text") => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit("send_message", {
        conversationId,
        senderId: user?.id,
        text,
        attachments,
        messageType: type
    });
  };

  const sendTyping = (typing: boolean) => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("typing", { conversationId, isTyping: typing });
  };

  return {
    messages,
    setMessages,
    isTyping,
    sendMessage,
    sendTyping
  };
}
