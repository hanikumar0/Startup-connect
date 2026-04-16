"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
    ShieldCheck, 
    FileText, 
    MessageSquare, 
    Send, 
    FileUp, 
    Download, 
    Loader2, 
    ArrowLeft,
    Search,
    Clock,
    User,
    ChevronRight,
    CircleDashed,
    Paperclip,
    ExternalLink,
    Lock,
    Eye,
    Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { initVDRSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import { Socket } from "socket.io-client";

interface VDRRoom {
    _id: string;
    startupId: string;
    investorId: string;
    matchId: string;
    isActive: boolean;
}

interface VDRMessage {
    _id: string;
    senderId: string;
    senderRole: string;
    message: string;
    createdAt: string;
    readStatus: boolean;
}

interface VDRFile {
    _id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedBy: string;
    uploadedAt: string;
    category: string;
    visibility: string;
    version: number;
    description?: string;
}

interface VDRDataField {
    _id: string;
    key: string;
    value: any;
    fieldType: string;
    visibility: string;
    createdBy: string;
}

export default function VDRPage() {
    const { matchId } = useParams();
    const router = useRouter();
    const { user, token } = useAuthStore();
    
    const [room, setRoom] = useState<VDRRoom | null>(null);
    const [messages, setMessages] = useState<VDRMessage[]>([]);
    const [files, setFiles] = useState<VDRFile[]>([]);
    const [dataFields, setDataFields] = useState<VDRDataField[]>([]);
    const [leftTab, setLeftTab] = useState<'documents' | 'data'>('documents');
    
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);

    // New Data Field State
    const [newDataKey, setNewDataKey] = useState("");
    const [newDataValue, setNewDataValue] = useState("");
    const [newDataVisibility, setNewDataVisibility] = useState<"shared" | "private">("shared");
    const [isSavingData, setIsSavingData] = useState(false);

    // Document Metadata State for Upload
    const [uploadCategory, setUploadCategory] = useState("other");
    const [uploadVisibility, setUploadVisibility] = useState<"shared" | "private">("shared");
    const [uploadDescription, setUploadDescription] = useState("");
    
    const socketRef = useRef<Socket | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Data Fetch
    const fetchRoomData = useCallback(async () => {
        setIsLoading(true);
        try {
            // 1. Get or Create Room
            const roomRes = await apiFetch(`/api/vdr/room/${matchId}`);
            const roomData = await roomRes.json();
            
            if (roomData.success) {
                const roomObj = roomData.room;
                setRoom(roomObj);

                // 2. Fetch Messages & Files in parallel
                const [msgsRes, filesRes, dataRes] = await Promise.all([
                    apiFetch(`/api/vdr/messages/${roomObj._id}`),
                    apiFetch(`/api/vdr/documents/${roomObj._id}`),
                    apiFetch(`/api/vdr/data/${roomObj._id}`)
                ]);

                const msgsData = await msgsRes.json();
                const filesData = await filesRes.json();
                const dataFieldsRes = await dataRes.json();

                if (msgsData.success) setMessages(msgsData.messages);
                if (filesData.success) setFiles(filesData.files);
                if (dataFieldsRes.success) setDataFields(dataFieldsRes.data);
                
                // 3. Initialize Socket
                if (token && user?.id) {
                    const socket = initVDRSocket(token, user.id);
                    socketRef.current = socket;

                    socket.emit("join_room", roomObj._id);

                    socket.on("receive_message", (msg: VDRMessage) => {
                        setMessages(prev => [...prev, msg]);
                        // Mark as read if we are looking at it
                        socket.emit("read_receipt", { roomId: roomObj._id, messageId: msg._id });
                    });

                    socket.on("user_typing", ({ isTyping }: { isTyping: boolean }) => {
                        setPartnerTyping(isTyping);
                    });

                    socket.on("message_read", ({ messageId }: { messageId: string }) => {
                        setMessages(prev => prev.map(m => m._id === messageId ? { ...m, readStatus: true } : m));
                    });
                }
            } else {
                toast.error("VDR authorization failed");
                router.push("/dashboard/network");
            }
        } catch (error) {
            console.error("VDR Init Error:", error);
            toast.error("Security breach or connection failure");
        } finally {
            setIsLoading(false);
        }
    }, [matchId, token, user?.id, router]);

    useEffect(() => {
        fetchRoomData();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [fetchRoomData]);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !room || !socketRef.current || isSending) return;

        setIsSending(true);
        try {
            socketRef.current.emit("send_message", {
                roomId: room._id,
                message: newMessage
            });
            
            // Optimistic update handled by socket receive_message event for consistency
            // Wait, usually we wait for it to come back or add it ourselves.
            // My socket implementation emits to the whole room including sender.
            
            setNewMessage("");
            socketRef.current.emit("typing", { roomId: room._id, isTyping: false });
            setIsTyping(false);
        } catch (error) {
            toast.error("Encrypted transmission failed");
        } finally {
            setIsSending(false);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        if (!isTyping && socketRef.current && room) {
            setIsTyping(true);
            socketRef.current.emit("typing", { roomId: room._id, isTyping: true });
        }
        
        // Clear typing after 2 seconds
        const timeout = setTimeout(() => {
            if (isTyping && socketRef.current && room) {
                socketRef.current.emit("typing", { roomId: room._id, isTyping: false });
                setIsTyping(false);
            }
        }, 2000);
        return () => clearTimeout(timeout);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !room) return;

        setIsUploading(true);
        const fileName = file.name;
        const fileType = fileName.split('.').pop() || 'document';

        try {
            // In a real app, you'd upload to S3/Cloudinary first.
            // Mocking the upload URL for this demonstration.
            const mockFileUrl = "https://example.com/vdr-document.pdf";

            const res = await apiFetch("/api/vdr/upload-vdr", {
                method: "POST",
                body: JSON.stringify({
                    roomId: room._id,
                    fileName,
                    fileUrl: mockFileUrl,
                    fileType: fileType.toUpperCase(),
                    category: uploadCategory,
                    visibility: uploadVisibility,
                    description: uploadDescription
                })
            });

            const data = await res.json();
            if (data.success) {
                setFiles(prev => [data.file, ...prev]);
                toast.success("Object deposited successfully");
                // Reset metadata
                setUploadDescription("");
            }
        } catch (error) {
            toast.error("Deposition protocol failure");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSaveData = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDataKey || !newDataValue || !room || isSavingData) return;

        setIsSavingData(true);
        try {
            const res = await apiFetch("/api/vdr/data", {
                method: "POST",
                body: JSON.stringify({
                    roomId: room._id,
                    key: newDataKey,
                    value: newDataValue,
                    visibility: newDataVisibility
                })
            });

            const data = await res.json();
            if (data.success) {
                setDataFields(prev => [data.field, ...prev]);
                setNewDataKey("");
                setNewDataValue("");
                toast.success("Structural data bonded");
            }
        } catch (error) {
            toast.error("Data bonding failure");
        } finally {
            setIsSavingData(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <CircleDashed className="h-10 w-10 text-indigo-600 opacity-20" />
                </motion.div>
                <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase italic">Decrypting Secure Room...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 overflow-hidden">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-10 w-10 p-0 rounded-2xl hover:bg-slate-100"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={18} />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-black text-[8px] tracking-[0.2em] uppercase px-2 h-5">
                                SECURE VIRTUAL DATA ROOM
                            </Badge>
                            <div className="h-1 w-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-1">
                                <ShieldCheck size={10} className="text-emerald-500" /> AES-256 ENCRYPTED
                            </span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">
                            Match Case <span className="text-indigo-600">#{room?._id.slice(-6).toUpperCase()}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest border-slate-200 gap-2">
                        <Lock size={12} /> SESSION SECURITY
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel: Documents & Data */}
                <div className="w-1/3 flex flex-col bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="px-8 pt-8 pb-4">
                        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-1">
                            <button 
                                onClick={() => setLeftTab('documents')}
                                className={cn(
                                    "flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                    leftTab === 'documents' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                DOCUMENTS
                            </button>
                            <button 
                                onClick={() => setLeftTab('data')}
                                className={cn(
                                    "flex-1 h-10 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                    leftTab === 'data' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                STRUCTURED DATA
                            </button>
                        </div>
                    </div>

                    {leftTab === 'documents' ? (
                        <>
                            <div className="p-8 border-b border-slate-50 bg-slate-50/30 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 italic">VDR Depot</h3>
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                
                                {/* Meta Controls for Upload */}
                                <div className="grid grid-cols-2 gap-2">
                                    <select 
                                        value={uploadCategory}
                                        onChange={(e) => setUploadCategory(e.target.value)}
                                        className="h-9 px-3 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="pitch_deck">PITCH DECK</option>
                                        <option value="financials">FINANCIALS</option>
                                        <option value="legal">LEGAL</option>
                                        <option value="traction">TRACTION</option>
                                        <option value="other">OTHER</option>
                                    </select>
                                    <select 
                                        value={uploadVisibility}
                                        onChange={(e) => setUploadVisibility(e.target.value as any)}
                                        className="h-9 px-3 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
                                    >
                                        <option value="shared">SHARED</option>
                                        <option value="private">PRIVATE</option>
                                    </select>
                                </div>

                                <Button 
                                    className="w-full h-11 bg-black hover:bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 transition-all active:scale-95"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                                    DEPOSIT OBJECT
                                </Button>

                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                                    <Input 
                                        placeholder="Search catalog..." 
                                        className="pl-10 h-10 rounded-xl bg-white border-slate-100 font-bold text-[11px] focus:ring-4 focus:ring-indigo-50 transition-all italic"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                                {files.length > 0 ? (
                                    files.map((file) => (
                                        <motion.div 
                                            key={file._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="group flex flex-col p-4 bg-white border border-slate-50 rounded-2xl hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-50 transition-colors">
                                                        <FileText size={18} className="text-slate-400 group-hover:text-indigo-500" />
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="text-[11px] font-black text-slate-800 tracking-tight truncate uppercase leading-none">{file.fileName}</p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <Badge className="h-4 bg-slate-50 text-slate-400 group-hover:bg-indigo-600/10 group-hover:text-indigo-600 border-none px-1 text-[8px] font-black">V{file.version}</Badge>
                                                            <span className="text-[9px] font-bold text-slate-300 uppercase italic">{formatDistanceToNow(new Date(file.uploadedAt))} ago</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                                                    <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download size={14} className="text-slate-400" />
                                                    </a>
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-4 p-2 bg-slate-50/50 rounded-lg">
                                                <Badge className="bg-indigo-600 text-white border-none h-4 px-1.5 text-[7px] font-black uppercase tracking-widest">{file.category}</Badge>
                                                {file.visibility === "private" && (
                                                    <Badge className="bg-amber-100 text-amber-600 border-none h-4 px-1.5 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Lock size={8} /> PRIVATE
                                                    </Badge>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-10">
                                        <Paperclip size={32} className="mb-4 opacity-10" />
                                        Depot Empty. Deposit objects for institutional audit.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 italic mb-6">Structural Insight</h3>
                                <form onSubmit={handleSaveData} className="space-y-3">
                                    <Input 
                                        placeholder="DATA KEY (e.g. ANNUAL REVENUE)"
                                        value={newDataKey}
                                        onChange={(e) => setNewDataKey(e.target.value.toUpperCase())}
                                        className="h-10 rounded-xl bg-white border-slate-100 font-bold text-[10px] tracking-widest italic"
                                    />
                                    <Input 
                                        placeholder="VALUE"
                                        value={newDataValue}
                                        onChange={(e) => setNewDataValue(e.target.value)}
                                        className="h-10 rounded-xl bg-white border-slate-100 font-bold text-[10px] italic"
                                    />
                                    <div className="flex gap-2">
                                        <select 
                                            value={newDataVisibility}
                                            onChange={(e) => setNewDataVisibility(e.target.value as any)}
                                            className="flex-1 h-10 px-3 bg-white border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100"
                                        >
                                            <option value="shared">SHARED</option>
                                            <option value="private">PRIVATE</option>
                                        </select>
                                        <Button 
                                            type="submit"
                                            disabled={isSavingData || !newDataKey || !newDataValue}
                                            className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest"
                                        >
                                            {isSavingData ? <Loader2 size={12} className="animate-spin" /> : "BOND DATA"}
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                {dataFields.map((field) => (
                                    <motion.div 
                                        key={field._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{field.key}</span>
                                            {field.visibility === 'private' && <Lock size={10} className="text-amber-500" />}
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <span className="text-xl font-black text-slate-900 tracking-tighter italic">{field.value}</span>
                                            <Badge className="bg-slate-50 text-slate-400 border-none h-4 text-[8px] font-black uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                {field.createdBy === user?.id ? "YOU" : "PARTNER"}
                                            </Badge>
                                        </div>
                                    </motion.div>
                                ))}
                                {dataFields.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30 italic text-[10px] font-black uppercase text-slate-400 tracking-widest text-center px-10">
                                        <Search size={32} className="mb-4 opacity-10" />
                                        No structural data detected. Bond new business primitives.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Right Panel: Chat Area */}
                <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center">
                                <MessageSquare size={18} className="text-indigo-600 font-bold" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 italic leading-none">Transmission Channel</h3>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" /> Channel Securely Bonded
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {partnerTyping && (
                                <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic animate-pulse"
                                >
                                    Partner is typing...
                                </motion.span>
                             )}
                        </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderId === user?.id;
                            const msgDate = new Date(msg.createdAt);
                            const prevMsgDate = idx > 0 ? new Date(messages[idx-1].createdAt) : null;
                            const showTime = idx === 0 || (prevMsgDate && differenceInMinutes(msgDate, prevMsgDate) > 10);
                            
                            return (
                                <div key={msg._id} className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                                    {showTime && (
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 w-full text-center italic">
                                            {format(msgDate, "HH:mm | MMM dd")}
                                        </p>
                                    )}
                                    <div className={cn("flex flex-col max-w-[80%]", isMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "px-5 py-4 rounded-[1.5rem] text-[13px] font-medium leading-relaxed shadow-sm transition-all hover:shadow-md",
                                            isMe 
                                                ? "bg-slate-900 text-white rounded-tr-none" 
                                                : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none"
                                        )}>
                                            {msg.message}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 px-1">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest opacity-70 italic">
                                                {isMe ? "YOU" : msg.senderRole.toUpperCase()}
                                            </span>
                                            {isMe && (
                                                <div className="flex items-center">
                                                    <Check size={10} className={cn("transition-colors", msg.readStatus ? "text-indigo-500" : "text-slate-200")} strokeWidth={4} />
                                                    {msg.readStatus && <Check size={10} className="-ml-1.5 text-indigo-500" strokeWidth={4} />}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-8 shrink-0">
                        <form onSubmit={handleSendMessage} className="relative group">
                            <Input 
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Transmit secure message..."
                                className="h-16 pl-6 pr-24 rounded-2xl bg-slate-50 border-none font-bold text-sm focus:ring-4 focus:ring-indigo-50 transition-all italic placeholder:text-slate-300 shadow-inner"
                                disabled={isSending}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Button 
                                    type="submit"
                                    className="h-12 w-12 p-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-90"
                                    disabled={!newMessage.trim() || isSending}
                                >
                                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={3} />}
                                </Button>
                            </div>
                        </form>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-4 italic text-center opacity-60">
                            Press Enter to Transmit via Secure Tunnel
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
