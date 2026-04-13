"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Search, MessageSquare, Loader2, Check, CheckCheck, ChevronRight, Paperclip, FileText, Download, X, Plus, Image as ImageIcon, Calendar, Clock, MapPin, Rocket, MoreHorizontal, Trash2, Edit2, Smile, CornerUpLeft, Forward, Copy, Eye, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface Message {
    _id?: string; // MongoDB ID for message editing/deletion
    conversationId: string;
    senderId: string;
    receiverId: string;
    text?: string;
    isRead: boolean;
    isEdited?: boolean;
    isDeletedForBoth?: boolean;
    deletedFor?: string[];
    createdAt: string;
    status?: string;
    messageType?: "text" | "image" | "file" | "pitch" | "link" | "meeting";
    attachments?: Array<{
        fileUrl: string;
        fileName: string;
        fileType: string;
        fileSize?: number;
        resourceType?: string;
        publicId?: string;
    }>;
    meetingInfo?: {
        meetingId: string;
        title: string;
        startTime: string;
        status: string;
    };
    fileUrl?: string; // Cloudinary CDN URL
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    resourceType?: string;
    publicId?: string;
    reactions?: Array<{
        userId: string;
        emoji: string;
    }>;
    isForwarded?: boolean;
    replyTo?: {
        messageId: string;
        text: string;
        senderName: string;
    };
    // UI-only optimistic state
    deletePending?: boolean;
    countdown?: number;
}

interface Connection {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    connectionId: string;
    conversationId?: string;
    unreadCount?: number;
    lastMessage?: {
        text: string;
        at: string;
    };
}

const optimizeCloudinaryUrl = (url: string, params: string = "f_auto,q_auto") => {
    if (!url || !url.includes("cloudinary.com")) return url;
    // Don't apply image optimization params to raw files (like PDFs)
    if (url.includes("/raw/upload/")) return url;
    return url.replace("/upload/", `/upload/${params}/`);
};

const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "—";
    if (bytes / 1024 > 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
};

const FileCard = ({ msg, isMine }: { msg: Message, isMine: boolean }) => {
    // 🔥 STRICT RULE: Use the secure_url directly without manual modification
    const rawUrl = msg.fileUrl || "";
    
    // Detection logic for UI presentation only
    const isPDF = msg.fileName?.toLowerCase().endsWith(".pdf") || msg.fileType?.includes("pdf") || rawUrl.toLowerCase().includes(".pdf");
    const isImage = !isPDF && (msg.messageType === "image" || (msg.fileName?.match(/\.(jpg|jpeg|png|gif)$/i)));
    const isPitch = msg.messageType === "pitch";
    
    // Fallback for legacy size keys
    const actualSize = msg.fileSize || (msg as any).size || 0;
    
    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!rawUrl) {
            alert("File is not available for viewing. Please re-upload.");
            return;
        }
        // ✅ Direct open for instant preview
        window.open(rawUrl, "_blank");
        
        if (!isMine && isPitch && msg._id) {
            apiFetch(`/api/messages/view-pitch/${msg._id}`, { method: "POST" });
        }
    };

    if (isPitch) {
        return (
            <div
                className="mt-2 bg-gradient-to-br from-indigo-500 to-indigo-900 p-4 rounded-2xl shadow-xl border border-white/20 min-w-[240px] cursor-pointer hover:scale-[1.01] transition-all group/pitch"
                onClick={handleAction}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10 shadow-inner">
                        <Rocket className="text-white h-5 w-5 group-hover/pitch:rotate-12 transition-transform" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-white/50 uppercase tracking-widest leading-none mb-1.5">Intelligence Asset</p>
                        <p className="text-[11px] font-black text-white truncate drop-shadow-sm">{msg.fileName || "Pitch Deck.pdf"}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <div className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[9px] font-black uppercase tracking-widest flex items-center justify-center rounded-lg transition-colors">
                            VIEW DECK
                        </div>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">
                            {formatFileSize(actualSize)}
                        </p>
                    </div>
                    <ChevronRight size={14} className="text-white/40 group-hover/pitch:translate-x-1 group-hover/pitch:text-white transition-all" />
                </div>
            </div>
        );
    }

    return (
        <div
            className={`mt-2 p-1.5 rounded-xl ${isMine ? "bg-white/10" : "bg-slate-50"} border ${isMine ? "border-white/10" : "border-slate-100"} shadow-sm transition-all hover:shadow-md cursor-pointer group/card max-w-[260px]`}
            onClick={handleAction}
        >
            {isImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900/5 mb-1.5 group-hover/card:scale-[1.01] transition-transform">
                    <img src={optimizeCloudinaryUrl(rawUrl || "", "w_600,c_fill,g_auto,f_auto,q_auto")} className="w-full h-full object-cover" alt={msg.fileName} />
                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all flex items-center justify-center">
                        <Eye className="text-white opacity-0 group-hover/card:opacity-100 transition-opacity" size={24} />
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 mb-1.5 p-2 bg-white rounded-lg border border-slate-50 shadow-inner">
                    <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${isPDF ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"}`}>
                        {isPDF ? <FileText size={20} /> : <File size={20} />}
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[10px] font-black text-slate-800 truncate leading-tight uppercase tracking-tight">{msg.fileName || "unnamed_attachment"}</p>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                            {formatFileSize(actualSize)}
                        </p>
                    </div>
                </div>
            )}

            <div className={`flex items-center justify-between px-1 py-1 rounded-lg ${isMine ? "bg-white/5" : "bg-white hover:bg-slate-100/50"} transition-colors`}>
                <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${isMine ? "text-indigo-200" : "text-indigo-600"}`}>
                    <Eye size={11} />
                    VIEW DECK
                </p>
                <div className="flex items-center gap-1.5">
                    <Download size={11} className={`${isMine ? "text-white/30" : "text-slate-300"} hover:text-indigo-400 transition-colors`} onClick={(e) => { e.stopPropagation(); window.open(rawUrl, "_blank"); }} />
                    <ChevronRight size={11} className={`${isMine ? "text-white/20" : "text-slate-200"} group-hover/card:translate-x-0.5 transition-transform`} />
                </div>
            </div>
        </div>
    );
};

export default function ChatPage() {
    const router = useRouter();
    const { user, _hasHydrated } = useAuthStore();
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedPartner, setSelectedPartner] = useState<Connection | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showMeetingDialog, setShowMeetingDialog] = useState(false);
    const [meetingDraft, setMeetingDraft] = useState({ title: "Intro Call", date: "", time: "10:00" });

    // File Preview States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [reactingMessageId, setReactingMessageId] = useState<string | null>(null);
    const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
    const [showForwardModal, setShowForwardModal] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: Message | null } | null>(null);
    const uploadAbortController = useRef<AbortController | null>(null);
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingDeleteTimers = useRef<Record<string, { timeout: NodeJS.Timeout, interval: NodeJS.Timeout }>>({});

    useEffect(() => {
        if (_hasHydrated && user) {
            fetchConnections();
        }
    }, [_hasHydrated, user]);

    const socket = getSocket();

    const handleScheduleMeeting = async () => {
        if (!selectedPartner || !user) return;
        const dateTime = new Date(`${meetingDraft.date}T${meetingDraft.time}`).toISOString();

        try {
            const response = await apiFetch("/api/meetings/schedule", {
                method: "POST",
                body: JSON.stringify({
                    title: meetingDraft.title,
                    guestId: selectedPartner.id,
                    startTime: dateTime
                })
            });
            const result = await response.json();
            if (result.success) {
                setShowMeetingDialog(false);
                fetchMessages(selectedPartner.conversationId!);
            }
        } catch (error) { }
    };

    const handleMeetingResponse = async (meetingId: string, status: "accepted" | "rejected") => {
        try {
            await apiFetch(`/api/meetings/${meetingId}/respond`, {
                method: "PUT",
                body: JSON.stringify({ status })
            });
            if (selectedPartner?.conversationId) fetchMessages(selectedPartner.conversationId);
        } catch (error) { }
    };


    const handleSharePitch = async () => {
        if (!selectedPartner || !user) return;

        try {
            console.log("[Chat] Attempting to share pitch...");
            const response = await apiFetch("/api/startup/me");
            const result = await response.json();

            if (result.success && result.data.pitchDeckUrl) {
                console.log("[Chat] Pitch deck found, sending...");
                const convId = selectedPartner.conversationId;
                const messageData = {
                    conversationId: convId,
                    senderId: user.id,
                    receiverId: selectedPartner.id,
                    text: `Shared Pitch Deck: ${result.data.startupName}`,
                    messageType: "pitch",
                    fileUrl: result.data.pitchDeckUrl,
                    fileName: `${result.data.startupName} - Pitch Deck.pdf`,
                    fileSize: 0,
                    attachments: [{
                        fileUrl: result.data.pitchDeckUrl,
                        fileName: `${result.data.startupName} - Pitch Deck.pdf`,
                        fileType: "application/pdf"
                    }],
                    createdAt: new Date().toISOString(),
                    status: "sent"
                };

                socket?.emit("sendMessage", messageData);
                setMessages(prev => [...prev, messageData as any]);

                // Also persist to API
                await apiFetch("/api/messages/send", {
                    method: "POST",
                    body: JSON.stringify({
                        conversationId: convId,
                        text: messageData.text,
                        receiverId: messageData.receiverId,
                        messageType: "pitch",
                        fileUrl: messageData.fileUrl,
                        fileName: messageData.fileName,
                        fileSize: messageData.fileSize,
                        attachments: messageData.attachments
                    }),
                });
            } else {
                console.warn("[Chat] No pitch deck found in profile.");
                alert("Please upload your Pitch Deck in your profile settings before sharing.");
            }
        } catch (error) {
            console.error("[Chat] Error sharing pitch:", error);
            alert("Failed to share pitch deck. Please try again.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedPartner?.conversationId || !user) return;

        // Pro-Level Validation: 50MB Limit
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            console.warn("❌ [CMS] File too large", file.size);
            alert("File too large. Maximum size allowed is 50MB.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setSelectedFile(file);
        if (file.type.startsWith("image/")) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }
        setShowPreviewModal(true);
    };

    const handleSendFile = async () => {
        console.log("🚀 [CMS] SEND ATTACHMENT CLICKED");
        if (!selectedFile || !selectedPartner?.conversationId || !user) {
            console.warn("❌ [CMS] Missing required data for send", {
                file: !!selectedFile,
                conv: !!selectedPartner?.conversationId,
                user: !!user
            });
            return;
        }

        setIsUploading(true);
        uploadAbortController.current = new AbortController();
        console.log("📤 [CMS] Uploading to Cloudinary...");
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await apiFetch("/api/messages/upload", {
                method: "POST",
                body: formData,
                signal: uploadAbortController.current.signal,
                timeout: 300000 // 5 minutes for large files
            });
            const result = await response.json();

            if (result.success) {
                console.log("☁️ [CMS] Cloudinary Upload Success:", result.data.fileUrl);
                const convId = selectedPartner.conversationId;
                let mType: "image" | "file" | "pitch" = "file";
                if (selectedFile.type.startsWith("image/")) mType = "image";
                else if (selectedFile.type.includes("pdf")) mType = "pitch";

                const messageData = {
                    conversationId: convId,
                    senderId: user.id,
                    receiverId: selectedPartner.id,
                    text: `Sent a ${mType === "image" ? "photo" : mType === "pitch" ? "pitch deck" : "file"}: ${selectedFile.name}`,
                    messageType: mType,
                    fileUrl: result.data.fileUrl,
                    fileName: result.data.fileName,
                    fileSize: result.data.fileSize,
                    fileType: result.data.fileType,
                    resourceType: result.data.resourceType,
                    publicId: result.data.publicId,
                    attachments: [result.data],
                    createdAt: new Date().toISOString(),
                    status: "sent"
                };

                // 🔥 EMIT SOCKET
                console.log("🔌 [CMS] Emitting socket 'sendMessage'...", mType);
                socket?.emit("sendMessage", messageData);

                // 🔥 OPTIMISTIC UI
                setMessages(prev => [...prev, messageData as any]);

                // Reset state
                setSelectedFile(null);
                setPreviewUrl(null);
                setShowPreviewModal(false);

                // Persist to API
                console.log("💾 [CMS] Persisting to DB via API...");
                await apiFetch("/api/messages/send", {
                    method: "POST",
                    body: JSON.stringify({
                        conversationId: convId,
                        text: messageData.text,
                        receiverId: messageData.receiverId,
                        messageType: mType,
                        fileUrl: messageData.fileUrl,
                        fileName: messageData.fileName,
                        fileSize: messageData.fileSize,
                        fileType: messageData.fileType,
                        resourceType: messageData.resourceType,
                        publicId: messageData.publicId,
                        attachments: messageData.attachments
                    }),
                });
                console.log("✅ [CMS] Message fully processed");
            } else {
                console.error("❌ [CMS] Backend Upload Failed:", result.message);
                alert(`Upload failed: ${result.message}`);
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("⛔ [CMS] Upload Aborted by user");
            } else {
                console.error("❌ [CMS] Critical Error during send:", error);
                alert("Connection error. Please check your network and try again.");
            }
        } finally {
            setIsUploading(false);
            uploadAbortController.current = null;
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleCancelUpload = () => {
        if (uploadAbortController.current) {
            uploadAbortController.current.abort();
            setIsUploading(false);
            setShowPreviewModal(false);
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    };

    const handleStartEdit = (msg: any) => {
        setEditingMessageId(msg._id);
        setEditText(msg.text);
    };

    const handleSaveEdit = async () => {
        if (!editingMessageId || !editText.trim()) return;

        try {
            const response = await apiFetch(`/api/messages/${editingMessageId}`, {
                method: "PUT",
                body: JSON.stringify({ text: editText })
            });
            const result = await response.json();
            if (result.success) {
                socket?.emit("edit_message", {
                    conversationId: selectedPartner?.conversationId,
                    messageId: editingMessageId,
                    text: editText
                });
                setEditingMessageId(null);
                setEditText("");
            }
        } catch (error) { }
    };

    const handleShowDeleteOptions = (msgId: string) => {
        setDeletingMessageId(msgId);
        setShowDeleteDialog(true);
    };

    const handleDeleteForMe = async () => {
        if (!deletingMessageId) return;

        // Optimistic UI Removal
        setMessages(prev => prev.filter(m => (m as any)._id !== deletingMessageId));
        setShowDeleteDialog(false);

        try {
            await apiFetch(`/api/messages/delete-for-me/${deletingMessageId}`, {
                method: "PUT"
            });
        } catch (error) {
            console.error("❌ [CMS] Delete for Me Failed", error);
        }
        setDeletingMessageId(null);
    };

    const handleDeleteForBoth = () => {
        if (!deletingMessageId) return;
        const msgId = deletingMessageId;
        setShowDeleteDialog(false);
        setDeletingMessageId(null);

        // Optimistic UI: Mark as pending delete for Both (Undo window)
        setMessages(prev => prev.map(m => (m as any)._id === msgId ? { ...m, deletePending: true, countdown: 4 } : m));

        // Start 4s permanent delete timer
        const timeout = setTimeout(() => {
            confirmPermanentDelete(msgId);
        }, 4000);

        // Start 1s countdown ticker
        const interval = setInterval(() => {
            setMessages(prev => prev.map(m => {
                if ((m as any)._id === msgId) {
                    const nextVal = ((m as any).countdown || 4) - 1;
                    return { ...m, countdown: nextVal };
                }
                return m;
            }));
        }, 1000);

        pendingDeleteTimers.current[msgId] = { timeout, interval };
    };

    const confirmPermanentDelete = async (msgId: string) => {
        // Clear trackers
        if (pendingDeleteTimers.current[msgId]) {
            clearInterval(pendingDeleteTimers.current[msgId].interval);
            delete pendingDeleteTimers.current[msgId];
        }

        try {
            const response = await apiFetch(`/api/messages/${msgId}`, {
                method: "DELETE"
            });
            const result = await response.json();
            if (result.success) {
                // Instantly remove locally
                setMessages(prev => prev.filter(m => (m as any)._id !== msgId));

                socket?.emit("delete_for_both", {
                    conversationId: selectedPartner?.conversationId,
                    messageId: msgId
                });
            }
        } catch (error) {
            // Revert state if permanent delete fails
            setMessages(prev => prev.map(m => (m as any)._id === msgId ? { ...m, deletePending: false } : m));
        }
    };

    const handleUndoDelete = (msgId: string) => {
        if (pendingDeleteTimers.current[msgId]) {
            clearTimeout(pendingDeleteTimers.current[msgId].timeout);
            clearInterval(pendingDeleteTimers.current[msgId].interval);
            delete pendingDeleteTimers.current[msgId];
        }

        setMessages(prev => prev.map(m => m._id === msgId ? { ...m, deletePending: false, countdown: 0 } : m));
        console.log("↩️ [CMS] Deletion Undone:", msgId);
    };

    const handleForwardMessage = async (targetPartner: Connection) => {
        if (!forwardingMessage || !user || !socket || !targetPartner.conversationId) return;

        console.log(`📤 [CMS] Forwarding message to: ${targetPartner.name}`);
        const forwardData: any = {
            conversationId: targetPartner.conversationId,
            senderId: user.id,
            receiverId: targetPartner.id,
            text: forwardingMessage.text,
            messageType: forwardingMessage.messageType || "text",
            attachments: forwardingMessage.attachments,
            fileUrl: forwardingMessage.fileUrl,
            fileName: forwardingMessage.fileName,
            fileSize: forwardingMessage.fileSize,
            isForwarded: true,
            createdAt: new Date().toISOString(),
            status: "sent"
        };

        socket.emit("sendMessage", forwardData);

        // If we are currently talking to this person, update UI
        if (selectedPartner?.id === targetPartner.id) {
            setMessages(prev => [...prev, forwardData]);
        }

        try {
            await apiFetch("/api/messages/send", {
                method: "POST",
                body: JSON.stringify({
                    conversationId: forwardData.conversationId,
                    text: forwardData.text,
                    receiverId: forwardData.receiverId,
                    messageType: forwardData.messageType,
                    attachments: forwardData.attachments,
                    fileUrl: forwardData.fileUrl,
                    fileName: forwardData.fileName,
                    fileSize: forwardData.fileSize,
                    isForwarded: true
                }),
            });
        } catch (error) {
            console.error("❌ [CMS] Forward Failed:", error);
        }

        setForwardingMessage(null);
        setShowForwardModal(false);
    };

    const handleSendReaction = (msgId: string, emoji: string) => {
        if (!user || !socket || !selectedPartner) return;

        socket.emit("add_reaction", {
            conversationId: selectedPartner.conversationId,
            messageId: msgId,
            emoji,
            userId: user.id
        });

        setShowEmojiPicker(false);
        setReactingMessageId(null);
        setContextMenu(null);
    };

    const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            msg
        });
    };

    const handleTouchStart = (e: React.TouchEvent, msg: Message) => {
        longPressTimer.current = setTimeout(() => {
            const touch = e.touches[0];
            setContextMenu({
                x: touch.clientX,
                y: touch.clientY,
                msg
            });
        }, 600);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setContextMenu(null);
        // Optional: show toast
        console.log("📋 [CMS] Text copied to clipboard");
    };

    useEffect(() => {
        const handleClose = () => setContextMenu(null);
        if (contextMenu) {
            window.addEventListener("click", handleClose);
            window.addEventListener("scroll", handleClose, true);
        }
        return () => {
            window.removeEventListener("click", handleClose);
            window.removeEventListener("scroll", handleClose, true);
        };
    }, [contextMenu]);

    useEffect(() => {
        if (!user || !socket) return;
        const receiveMessageHandler = (message: Message) => {
            if (selectedPartner && String(message.conversationId) === String(selectedPartner.conversationId)) {
                setMessages((prev) => {
                    const exists = prev.some(m =>
                        m.text === message.text &&
                        String(m.senderId) === String(message.senderId) &&
                        Math.abs(new Date(m.createdAt).getTime() - new Date(message.createdAt).getTime()) < 1000
                    );
                    if (exists) return prev;
                    return [...prev, message];
                });
                socket.emit("mark_messages_read", {
                    conversationId: message.conversationId,
                    userId: user.id
                });
            }
        };
        const readHandler = ({ conversationId }: { conversationId: string }) => {
            if (selectedPartner && String(conversationId) === String(selectedPartner.conversationId)) {
                setMessages((prev) => prev.map(m => ({ ...m, isRead: true })));
            }
        };
        const typingHandler = ({ senderId, isTyping }: { senderId: string, isTyping: boolean }) => {
            if (selectedPartner && String(senderId) === String(selectedPartner.id)) {
                setPartnerTyping(isTyping);
            }
        };

        const editHandler = ({ messageId, text }: { messageId: string, text: string }) => {
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, text, isEdited: true } : m));
        };

        const deleteForBothHandler = ({ messageId }: { messageId: string }) => {
            setMessages(prev => prev.filter(m => m._id !== messageId ? true : false));
        };

        const reactionUpdatedHandler = ({ messageId, reactions }: { messageId: string, reactions: any[] }) => {
            console.log("😊 [CMS] Reaction Updated Received:", messageId);
            setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
        };

        socket.on("receiveMessage", receiveMessageHandler);
        socket.on("messages_marked_read", readHandler);
        socket.on("user_typing", typingHandler);
        socket.on("message_edited", editHandler);
        socket.on("message_deleted_for_both", deleteForBothHandler);
        socket.on("reaction_updated", reactionUpdatedHandler);

        return () => {
            socket.off("receiveMessage", receiveMessageHandler);
            socket.off("messages_marked_read", readHandler);
            socket.off("user_typing", typingHandler);
            socket.off("message_edited", editHandler);
            socket.off("message_deleted_for_both", deleteForBothHandler);
            socket.off("reaction_updated", reactionUpdatedHandler);
        };
    }, [user, selectedPartner, socket]);

    useEffect(() => {
        if (selectedPartner?.conversationId && user && socket) {
            setPartnerTyping(false);
            const convId = selectedPartner.conversationId;
            socket.emit("join_conversation", convId);
            fetchMessages(convId);
            socket.emit("mark_messages_read", {
                conversationId: convId,
                userId: user.id
            });
        }
    }, [selectedPartner, user, socket]);

    const fetchConnections = async () => {
        try {
            const response = await apiFetch("/api/users/connections");
            const data = await response.json();
            if (data.success) {
                setConnections(data.connections);
                const searchParams = new URLSearchParams(window.location.search);
                const directId = searchParams.get("id");

                if (directId) {
                    const partner = data.connections.find((c: Connection) => c.conversationId === directId || c.id === directId);
                    if (partner) {
                        setSelectedPartner(partner);
                        return;
                    }
                }

                if (data.connections.length > 0 && !selectedPartner) {
                    setSelectedPartner(data.connections[0]);
                }
            }
        } catch (error) { } finally { setIsLoading(false); }
    };

    const fetchMessages = async (convId: string) => {
        try {
            const response = await apiFetch(`/api/chat/messages/${convId}`);
            const data = await response.json();
            if (data.success) setMessages(data.messages);
        } catch (error) { }
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();

        if (!inputText.trim() || !socket || !selectedPartner?.conversationId || !user) {
            return;
        }

        console.log("🚀 [CMS] SEND TEXT CLICKED");
        const convId = selectedPartner.conversationId;
        const messageData: any = {
            conversationId: convId,
            senderId: user.id,
            receiverId: selectedPartner.id,
            text: inputText,
            createdAt: new Date().toISOString(),
            status: "sending"
        };

        if (replyingToMessage) {
            messageData.replyTo = {
                messageId: replyingToMessage._id,
                text: replyingToMessage.text?.substring(0, 100) || (replyingToMessage.messageType === "pitch" ? "Pitch Deck" : "Attachment"),
                senderName: replyingToMessage.senderId === user.id ? "You" : selectedPartner.name
            };
        }

        setMessages((prev) => [...prev, messageData as any]);
        setInputText("");
        setReplyingToMessage(null);

        console.log("🔌 [CMS] Emitting socket 'sendMessage' (Text)", messageData.replyTo ? "with Reply" : "");
        socket.emit("sendMessage", messageData);

        try {
            const response = await apiFetch("/api/messages/send", {
                method: "POST",
                body: JSON.stringify({
                    conversationId: convId,
                    text: messageData.text,
                    receiverId: messageData.receiverId,
                    messageType: (messageData as any).messageType || "text",
                    replyTo: messageData.replyTo
                }),
            });

            const result = await response.json();

            if (result.success) {
                setMessages(prev => prev.map(msg =>
                    (msg.text === messageData.text && msg.status === "sending")
                        ? { ...result.data, status: "sent" }
                        : msg
                ));
                socket.emit("stop_typing", { conversationId: convId, userId: user.id });
            } else {
                setMessages(prev => prev.filter(msg => msg !== (messageData as any)));
            }
        } catch (error: any) { }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (!socket || !selectedPartner?.conversationId || !user) return;
        const convId = selectedPartner.conversationId;
        socket.emit("typing", { conversationId: convId, isTyping: true });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("typing", { conversationId: convId, isTyping: false });
        }, 2000);
    };

    useEffect(() => {
        if (scrollRef.current) {
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
            }
        }
    }, [messages]);

    if (isLoading || !user) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>;

    return (
        <div className="space-y-4 h-[calc(100vh-220px)] flex flex-col">
            <div className="flex items-center justify-between py-1 border-b border-slate-50 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm font-black text-slate-900 tracking-tight">Direct Messaging</h2>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase text-slate-400">Total Chats:</span>
                        <span className="text-[11px] font-black text-slate-700">{connections.length}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                <Card className="w-72 flex flex-col border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden shrink-0">
                    <CardHeader className="p-3 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                            <Input placeholder="Filter chats..." className="pl-9 h-8 text-[10px] bg-slate-50 border-none rounded-lg font-bold" />
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="divide-y divide-slate-50">
                            {connections.map((conn) => (
                                <div
                                    key={conn.connectionId || conn.id}
                                    onClick={() => setSelectedPartner(conn)}
                                    className={`flex items-center gap-2.5 p-3 cursor-pointer transition-all ${selectedPartner?.id === conn.id ? 'bg-indigo-50 border-r-2 border-indigo-600' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs relative border border-slate-100 shrink-0 shadow-inner">
                                        {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover rounded-lg" alt={conn.name} /> : conn.name.charAt(0)}
                                        <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="text-[11px] font-black text-slate-900 truncate leading-tight">{conn.name}</p>
                                            {conn.lastMessage?.at && (
                                                <span className="text-[7px] font-bold text-slate-300 uppercase">
                                                    {new Date(conn.lastMessage.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-0.5">
                                            <p className="text-[8px] font-bold text-slate-400 truncate italic">
                                                {conn.lastMessage ? conn.lastMessage.text : "No messages yet"}
                                            </p>
                                            {(conn.unreadCount ?? 0) > 0 && (
                                                <Badge className="h-4 min-w-[16px] rounded-full bg-indigo-600 border-none text-white text-[7px] flex items-center justify-center p-0 px-1 shadow-sm">
                                                    {conn.unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>

                <Card className="flex-1 flex flex-col min-w-0 border-slate-100 shadow-sm bg-white rounded-xl overflow-hidden">
                    {selectedPartner ? (
                        <div className="flex flex-col h-full">
                            <CardHeader className="border-b border-slate-50 bg-white px-5 py-3 shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 relative shadow-inner">
                                            {selectedPartner.avatar ? <img src={selectedPartner.avatar} className="w-full h-full object-cover rounded-lg" /> : selectedPartner.name.charAt(0)}
                                            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></span>
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 leading-tight">{selectedPartner.name}</p>
                                            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{selectedPartner.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowMeetingDialog(true)}
                                            className="h-7 rounded-md text-[8px] font-black uppercase tracking-widest border-slate-100 px-3 text-indigo-600 hover:bg-indigo-50 transition-colors gap-1.5"
                                        >
                                            <Calendar size={10} />
                                            Schedule
                                        </Button>
                                        <Button variant="outline" className="h-7 rounded-md text-[8px] font-black uppercase tracking-widest border-slate-100 px-3 text-slate-400 hover:text-indigo-600 transition-colors">Profile</Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <div className="flex-1 min-h-0 relative bg-slate-50/10">
                                <ScrollArea className="h-full w-full" ref={scrollRef}>
                                    <div className="p-5 space-y-4">
                                        {messages
                                            .filter(msg =>
                                                !msg.isDeletedForBoth &&
                                                !(msg.deletedFor || []).includes(user.id)
                                            )
                                            .map((msg, index) => {
                                                const isMine = String(msg.senderId) === String(user.id);
                                                const isMeeting = msg.messageType === "meeting";
                                                return (
                                                    <div key={index} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                                        <div className="flex items-end gap-2 max-w-[80%]">
                                                            {!isMine && (
                                                                <div className="h-6 w-6 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm border border-white">
                                                                    {selectedPartner.avatar ? <img src={selectedPartner.avatar} className="w-full h-full object-cover rounded-lg" /> : selectedPartner.name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div
                                                                onContextMenu={(e) => handleContextMenu(e, msg)}
                                                                onTouchStart={(e) => handleTouchStart(e, msg)}
                                                                onTouchEnd={handleTouchEnd}
                                                                className={`rounded-xl overflow-hidden shadow-sm relative group ${msg.isDeletedForBoth ? "bg-slate-50 border border-slate-100 italic text-slate-300" :
                                                                    msg.deletePending ? "bg-red-50 border-red-100 border shadow-md" :
                                                                        isMine ? (isMeeting ? "bg-indigo-600 text-white" : "bg-slate-900 text-white rounded-br-none") : "bg-white text-slate-900 rounded-bl-none border border-slate-100"
                                                                    }`}
                                                            >
                                                                {msg.isDeletedForBoth ? (
                                                                    <div className="px-4 py-2 flex items-center gap-2">
                                                                        <Trash2 size={10} className="text-slate-300" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Message deleted</span>
                                                                    </div>
                                                                ) : msg.deletePending ? (
                                                                    <div className="px-4 py-2.5 flex items-center gap-3 min-w-[200px]">
                                                                        <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-black text-red-600 animate-pulse">
                                                                            {msg.countdown || 4}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <p className="text-[9px] font-black text-red-900 uppercase tracking-widest leading-none">Deleting soon...</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleUndoDelete(msg._id!)}
                                                                            className="h-6 px-3 rounded-lg bg-red-600 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors shadow-sm"
                                                                        >
                                                                            Undo
                                                                        </button>
                                                                    </div>
                                                                ) : isMeeting ? (
                                                                    <div className="p-4 min-w-[240px]">
                                                                        {msg.replyTo && (
                                                                            <div className={`mb-3 p-2 rounded-lg border-l-4 overflow-hidden bg-white/10 border-white/30`}>
                                                                                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 text-white/70`}>
                                                                                    {msg.replyTo.senderName}
                                                                                </p>
                                                                                <p className={`text-[10px] line-clamp-1 italic text-white/80`}>
                                                                                    {msg.replyTo.text}
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                        <div className="flex items-center gap-3 mb-3">
                                                                            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                                                                                <Calendar size={20} className="text-white" />
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">Meeting Request</p>
                                                                                <p className="text-[12px] font-black text-white">{msg.text?.replace("📅 New Meeting Scheduled: ", "").split(" at ")[0] || "Intro Call"}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1.5 mb-4">
                                                                            <div className="flex items-center gap-2 text-[9px] font-bold text-white/90">
                                                                                <Clock size={12} />
                                                                                {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-[9px] font-bold text-white/90">
                                                                                <MapPin size={12} />
                                                                                Google Meet (Auto-generated)
                                                                            </div>
                                                                        </div>
                                                                        {!isMine && (
                                                                            <div className="flex gap-2">
                                                                                <Button onClick={() => handleMeetingResponse(msg.meetingInfo?.meetingId!, "accepted")} className="flex-1 h-8 bg-white text-indigo-600 hover:bg-slate-100 text-[9px] font-black uppercase rounded-lg shadow-sm">Accept</Button>
                                                                                <Button variant="outline" onClick={() => handleMeetingResponse(msg.meetingInfo?.meetingId!, "rejected")} className="flex-1 h-8 border-white/20 text-white hover:bg-white/10 text-[9px] font-black uppercase rounded-lg">Reject</Button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        {msg.isForwarded && (
                                                                            <div className={`px-4 pt-2 flex items-center gap-1.5 opacity-50 ${isMine ? "text-white" : "text-slate-500"}`}>
                                                                                <Forward size={9} />
                                                                                <span className="text-[7.5px] font-black uppercase tracking-widest italic leading-none">Forwarded</span>
                                                                            </div>
                                                                        )}

                                                                        {msg.replyTo && (
                                                                            <div className={`mx-2 mt-2 p-2 rounded-lg border-l-4 overflow-hidden ${isMine ? "bg-white/10 border-white/30" : "bg-slate-50 border-indigo-500"}`}>
                                                                                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isMine ? "text-white/70" : "text-indigo-600"}`}>
                                                                                    {msg.replyTo.senderName}
                                                                                </p>
                                                                                <p className={`text-[10px] line-clamp-1 italic ${isMine ? "text-white/80" : "text-slate-500"}`}>
                                                                                    {msg.replyTo.text}
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* ATTACHMENTS NORMALIZATION */}
                                                                        <div className="flex flex-col gap-1">
                                                                            {msg.attachments?.map((att, i) => (
                                                                                <FileCard key={i} msg={{ ...msg, fileUrl: att.fileUrl, fileName: att.fileName, fileSize: att.fileSize, fileType: att.fileType, resourceType: att.resourceType, publicId: att.publicId }} isMine={isMine} />
                                                                            ))}
                                                                            {msg.fileUrl && (!msg.attachments || msg.attachments.length === 0) && (
                                                                                <FileCard msg={msg} isMine={isMine} />
                                                                            )}
                                                                        </div>

                                                                        {msg.text && (
                                                                            <div className={`${msg.messageType === "pitch" || msg.fileUrl || msg.attachments?.length ? "px-4 pb-2 pt-1" : "px-4 py-2"}`}>
                                                                                {editingMessageId === msg._id ? (
                                                                                    <div className="flex flex-col gap-2 min-w-[200px] py-1">
                                                                                        <textarea
                                                                                            value={editText}
                                                                                            onChange={(e) => setEditText(e.target.value)}
                                                                                            className="w-full bg-slate-800 text-white text-[11px] font-bold p-2 rounded border border-white/20 focus:outline-none min-h-[60px]"
                                                                                        />
                                                                                        <div className="flex justify-end gap-1.5">
                                                                                            <button onClick={() => setEditingMessageId(null)} className="h-6 px-2 text-[8px] font-black uppercase bg-white/10 hover:bg-white/20 rounded">Cancel</button>
                                                                                            <button onClick={handleSaveEdit} className="h-6 px-2 text-[8px] font-black uppercase bg-white text-indigo-600 hover:bg-slate-100 rounded">Save</button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="relative group/text flex items-center gap-1.5">
                                                                                        <p className="text-[11px] font-bold leading-relaxed">{msg.text}</p>
                                                                                        {msg.isEdited && <span className="text-[7px] font-black uppercase opacity-60 ml-0.5 mt-0.5">(edited)</span>}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}

                                                                <div className={`px-4 pb-2 text-[7px] font-black uppercase tracking-widest flex items-center justify-end gap-1.5 ${isMine ? "text-white/40" : "text-slate-300"}`}>
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    {isMine && !msg.isDeletedForBoth && (msg.isRead ? <CheckCheck size={9} className="text-indigo-400" /> : <Check size={9} />)}
                                                                </div>

                                                                {/* REACTIONS DISPLAY */}
                                                                {msg.reactions && msg.reactions.length > 0 && (
                                                                    <div className={`flex flex-wrap gap-1 px-2 pb-2 ${isMine ? "justify-end" : "justify-start"}`}>
                                                                        {Object.entries(
                                                                            msg.reactions.reduce((acc: Record<string, number>, r) => {
                                                                                acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                                                                                return acc;
                                                                            }, {})
                                                                        ).map(([emoji, count]) => (
                                                                            <motion.div
                                                                                initial={{ scale: 0.5, opacity: 0 }}
                                                                                animate={{ scale: 1, opacity: 1 }}
                                                                                key={emoji}
                                                                                onClick={() => handleSendReaction(msg._id!, emoji)}
                                                                                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border cursor-pointer hover:scale-110 transition-all shadow-sm ${msg.reactions?.some(r => r.userId === user.id && r.emoji === emoji)
                                                                                    ? "bg-indigo-600 border-indigo-700 text-white"
                                                                                    : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
                                                                                    }`}
                                                                            >
                                                                                <span>{emoji}</span>
                                                                                {count > 1 && <span className="opacity-80">{count}</span>}
                                                                            </motion.div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* HOVER ACTIONS - Expanded Group */}
                                                            {!msg.isDeletedForBoth && !editingMessageId && (
                                                                <div className={`absolute top-0 -translate-y-[calc(100%+4px)] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-0.5 bg-white border border-slate-100 shadow-2xl rounded-full px-1.5 py-1 z-30 ${isMine ? "right-0" : "left-0"}`}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setReactingMessageId(msg._id!);
                                                                            setShowEmojiPicker(true);
                                                                        }}
                                                                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
                                                                        title="React"
                                                                    >
                                                                        <Smile size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setReplyingToMessage(msg)}
                                                                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
                                                                        title="Reply"
                                                                    >
                                                                        <CornerUpLeft size={12} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setForwardingMessage(msg);
                                                                            setShowForwardModal(true);
                                                                        }}
                                                                        className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
                                                                        title="Forward"
                                                                    >
                                                                        <Forward size={12} />
                                                                    </button>
                                                                    {isMine && (
                                                                        <>
                                                                            <button onClick={() => handleStartEdit(msg)} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors" title="Edit">
                                                                                <Edit2 size={12} />
                                                                            </button>
                                                                            <button onClick={() => handleShowDeleteOptions(msg._id!)} className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-full transition-colors" title="Delete">
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        {partnerTyping && (
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-lg bg-slate-100 shrink-0 flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-50">
                                                    {selectedPartner.name.charAt(0)}
                                                </div>
                                                <div className="bg-white border border-slate-100 rounded-lg px-2.5 py-1 shadow-sm">
                                                    <span className="text-[7.5px] font-black text-indigo-400 uppercase tracking-widest animate-pulse italic">typing...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>

                            <CardFooter className="border-t border-slate-50 bg-white p-3 shrink-0 relative">
                                {/* REPLY PREVIEW */}
                                <AnimatePresence>
                                    {replyingToMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: -65, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute left-3 right-3 bg-white border border-slate-100 shadow-[0_-15px_30px_-5px_rgba(0,0,0,0.1)] rounded-2xl p-2.5 flex items-center justify-between gap-3 z-40"
                                        >
                                            <div className="flex-1 min-w-0 border-l-4 border-indigo-500 pl-3">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <CornerUpLeft size={10} className="text-indigo-600" />
                                                    <p className="text-[9px] font-black uppercase text-indigo-600 tracking-widest leading-none">
                                                        Replying to {replyingToMessage.senderId === user.id ? "You" : selectedPartner?.name}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-500 truncate italic">
                                                    {replyingToMessage.text || (replyingToMessage.messageType === "pitch" ? "Pitch Deck Invitation" : "Attachment Selection")}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setReplyingToMessage(null)}
                                                className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all hover:rotate-90"
                                            >
                                                <X size={12} />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                    <div className="flex items-center gap-1">
                                        <Button type="button" size="icon" onClick={() => fileInputRef.current?.click()} className="h-9 w-9 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-lg shadow-sm shrink-0 border border-slate-100 transition-all">
                                            <Paperclip size={14} />
                                        </Button>
                                        {user.role === "startup" && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                onClick={handleSharePitch}
                                                className="h-9 w-9 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg shadow-sm shrink-0 border border-indigo-100 transition-all"
                                                title="Share Pitch Deck"
                                            >
                                                <Rocket size={14} />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="flex-1 relative">
                                        <Input
                                            placeholder="Type message..."
                                            value={inputText}
                                            onChange={handleTyping}
                                            className="h-9 pl-3 pr-10 bg-slate-50 border-none rounded-lg text-[10px] font-bold shadow-inner"
                                        />
                                    </div>
                                    <Button type="submit" size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg shadow-sm shrink-0 transition-all">
                                        <Send size={14} />
                                    </Button>
                                </form>
                            </CardFooter>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/5">
                            <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center mb-4 transition-all hover:scale-105">
                                <MessageSquare className="h-6 w-6 text-slate-200" />
                            </div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Select Thread</h3>
                            <p className="max-w-xs text-[10px] text-slate-400 font-bold mt-1 opacity-70 italic">Pick a connection to view conversation history.</p>
                        </div>
                    )}
                </Card>
            </div>
            {/* Meeting Dialog */}
            <Dialog open={showMeetingDialog} onOpenChange={setShowMeetingDialog}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                    <DialogHeader className="bg-indigo-600 p-6 text-white space-y-0 text-left">
                        <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Calendar size={20} />
                            Schedule Meeting
                        </DialogTitle>
                        <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-widest text-white/80">Connect with {selectedPartner?.name}</p>
                    </DialogHeader>
                    <div className="p-6 space-y-4 bg-white">
                        <div className="space-y-1.5">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Meeting Title</Label>
                            <Input
                                value={meetingDraft.title}
                                onChange={(e) => setMeetingDraft(prev => ({ ...prev, title: e.target.value }))}
                                className="h-10 text-[11px] font-bold bg-slate-50 border-none rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Date</Label>
                                <Input
                                    type="date"
                                    value={meetingDraft.date}
                                    onChange={(e) => setMeetingDraft(prev => ({ ...prev, date: e.target.value }))}
                                    className="h-10 text-[11px] font-bold bg-slate-50 border-none rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Time</Label>
                                <Input
                                    type="time"
                                    value={meetingDraft.time}
                                    onChange={(e) => setMeetingDraft(prev => ({ ...prev, time: e.target.value }))}
                                    className="h-10 text-[11px] font-bold bg-slate-50 border-none rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-6 pt-0 bg-white">
                        <Button variant="ghost" onClick={() => setShowMeetingDialog(false)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600">Cancel</Button>
                        <Button onClick={handleScheduleMeeting} className="bg-indigo-600 hover:bg-slate-900 text-white rounded-xl px-6 text-[10px] font-black uppercase shadow-lg shadow-indigo-200 transition-all">Schedule Call</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FORWARD MODAL */}
            <Dialog open={showForwardModal} onOpenChange={setShowForwardModal}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden outline-none">
                    <DialogHeader className="bg-slate-900 p-6 text-white bg-gradient-to-br from-slate-900 to-indigo-950 space-y-0 text-left">
                        <DialogTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Forward size={20} className="text-indigo-400" />
                            Forward Message
                        </DialogTitle>
                        <p className="text-[10px] font-bold opacity-60 mt-1 uppercase tracking-widest leading-relaxed text-white/60">Share intelligence signals with your selected connection.</p>
                    </DialogHeader>

                    <div className="p-4 space-y-4 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                            <Input placeholder="Search within network..." className="pl-9 h-10 text-[11px] bg-slate-50 border-none rounded-xl font-bold focus:ring-1 focus:ring-indigo-100" />
                        </div>

                        <ScrollArea className="h-60">
                            <div className="space-y-1 pr-3">
                                {connections.length > 0 ? (
                                    connections.map((conn) => (
                                        <div
                                            key={conn.connectionId || conn.id}
                                            onClick={() => handleForwardMessage(conn)}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50/50 cursor-pointer border border-transparent hover:border-indigo-100 transition-all active:scale-[0.98] group"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-[10px] border border-indigo-100 shrink-0 relative shadow-sm">
                                                {conn.avatar ? <img src={conn.avatar} className="w-full h-full object-cover rounded-lg" /> : conn.name.charAt(0)}
                                                <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-white"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">{conn.name}</p>
                                                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic">{conn.role}</p>
                                            </div>
                                            <div className="h-6 px-1.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="h-7 rounded-lg bg-white border border-slate-100 px-2 flex items-center justify-center shadow-sm">
                                                    <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Share</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-40">
                                        <Forward size={24} className="mb-2" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No connections found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>

            {/* PREVIEW MODAL */}
            <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
                <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-2xl border-none">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-black text-slate-900 uppercase tracking-widest">Preview Attachment</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 flex flex-col items-center justify-center gap-4">
                        {selectedFile?.type.startsWith("image/") ? (
                            <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative shadow-inner">
                                {previewUrl && <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />}
                            </div>
                        ) : (
                            <div className="w-full p-8 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <FileText size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] font-black text-slate-900 truncate max-w-[250px]">{selectedFile?.name}</p>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{(selectedFile?.size || 0) / 1024 > 1024 ? `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB` : `${((selectedFile?.size || 0) / 1024).toFixed(2)} KB`}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            disabled={isUploading}
                            onClick={() => {
                                setShowPreviewModal(false);
                                setSelectedFile(null);
                                setPreviewUrl(null);
                            }}
                            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        {isUploading ? (
                            <Button
                                onClick={handleCancelUpload}
                                className="h-10 rounded-xl bg-slate-900 border-none text-white text-[10px] font-black uppercase tracking-widest gap-2"
                            >
                                <X className="h-3 w-3" />
                                Stop Upload
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSendFile}
                                className="h-10 rounded-xl bg-indigo-600 hover:bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest gap-2"
                            >
                                <Send className="h-3 w-3" />
                                Send Attachment
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE OPTIONS DIALOG */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[400px] bg-white rounded-2xl shadow-2xl border-none p-0 overflow-hidden">
                    <DialogHeader className="bg-slate-900 p-6 text-center space-y-0">
                        <div className="h-16 w-16 bg-red-100/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="text-red-400 h-8 w-8" />
                        </div>
                        <DialogTitle className="text-white text-lg font-black uppercase tracking-tighter">Delete Message?</DialogTitle>
                        <p className="text-slate-400 text-[11px] font-bold mt-2 leading-relaxed">Choose how you would like to remove this interaction from the conversation history.</p>
                    </DialogHeader>

                    <div className="p-4 space-y-3">
                        <Button
                            onClick={handleDeleteForBoth}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-red-100"
                        >
                            Delete for Both Sides
                        </Button>
                        <Button
                            onClick={handleDeleteForMe}
                            variant="outline"
                            className="w-full h-12 border-slate-200 text-slate-600 hover:bg-slate-50 text-[10px] font-black uppercase tracking-widest rounded-xl"
                        >
                            Delete for Me Only
                        </Button>
                        <Button
                            onClick={() => setShowDeleteDialog(false)}
                            variant="ghost"
                            className="w-full h-10 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* EMOJI PICKER DIALOG */}
            <Dialog open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <DialogContent className="sm:max-w-fit bg-transparent border-none shadow-none p-0 overflow-hidden outline-none">
                    <DialogTitle className="sr-only">Select Emoji Reaction</DialogTitle>
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            if (reactingMessageId) {
                                handleSendReaction(reactingMessageId, emojiData.emoji);
                            }
                        }}
                        theme={Theme.LIGHT}
                        lazyLoadEmojis={true}
                    />
                </DialogContent>
            </Dialog>

            {/* WHATSAPP STYLE CONTEXT MENU */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        className="fixed z-[9999] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl py-2 min-w-[180px] overflow-hidden backdrop-blur-xl bg-white/95 ring-1 ring-slate-100"
                        style={{
                            top: Math.min(contextMenu.y, typeof window !== 'undefined' ? window.innerHeight - 300 : contextMenu.y),
                            left: Math.min(contextMenu.x, typeof window !== 'undefined' ? window.innerWidth - 200 : contextMenu.x)
                        }}
                    >
                        <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-50 mb-1 bg-slate-50/50">
                            {['❤️', '👍', '🔥', '😂', '😮', '😢'].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendReaction(contextMenu.msg?._id!, emoji);
                                    }}
                                    className="hover:scale-125 active:scale-95 transition-all text-base"
                                >
                                    {emoji}
                                </button>
                            ))}
                            <div className="w-px h-4 bg-slate-200 mx-1"></div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setReactingMessageId(contextMenu.msg?._id!);
                                    setShowEmojiPicker(true);
                                    setContextMenu(null);
                                }}
                                className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                                <Plus size={12} />
                            </button>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setReplyingToMessage(contextMenu.msg);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors text-left"
                        >
                            <CornerUpLeft size={14} className="opacity-70" /> Reply Context
                        </button>

                        {contextMenu.msg?.text && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(contextMenu.msg!.text!);
                                }}
                                className="w-full px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors text-left"
                            >
                                <Copy size={14} className="opacity-70" /> Copy Intelligence
                            </button>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setForwardingMessage(contextMenu.msg);
                                setShowForwardModal(true);
                                setContextMenu(null);
                            }}
                            className="w-full px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors text-left"
                        >
                            <Forward size={14} className="opacity-70" /> Forward Signal
                        </button>

                        {(contextMenu.msg?.senderId === user.id) && (
                            <div className="border-t border-slate-50 mt-1 pt-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartEdit(contextMenu.msg);
                                        setContextMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-[10px] font-black uppercase text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors text-left"
                                >
                                    <Edit2 size={14} className="opacity-70" /> Modify Message
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleShowDeleteOptions(contextMenu.msg?._id!);
                                        setContextMenu(null);
                                    }}
                                    className="w-full px-4 py-2.5 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors text-left"
                                >
                                    <Trash2 size={14} className="opacity-70" /> Delete Message
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
