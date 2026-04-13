"use client";

import { useEffect, useState, useCallback } from "react";
import { 
    Search, 
    User, 
    Building2, 
    MessageSquare, 
    Calendar, 
    ShieldCheck, 
    Mail, 
    Loader2, 
    Sparkles, 
    ChevronRight,
    Users,
    Inbox,
    Send,
    CheckCircle2,
    XCircle,
    Clock,
    UserMinus,
    ExternalLink,
    Filter,
    ArrowUpRight,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initSocket } from "@/lib/socket";
import { useAuthStore } from "@/lib/store";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ConnectionUser {
    _id: string;
    name: string;
    role: string;
    avatar?: string;
    bio?: string;
    email?: string;
}

interface ConnectionRequest {
    _id: string;
    sender: ConnectionUser;
    recipient: ConnectionUser;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
    message?: string;
    createdAt: string;
}

export default function ConnectionsPage() {
    const { user, token } = useAuthStore();
    const [activeTab, setActiveTab] = useState("received");
    const [received, setReceived] = useState<ConnectionRequest[]>([]);
    const [sent, setSent] = useState<ConnectionRequest[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [receivedRes, sentRes, connectionsRes] = await Promise.all([
                apiFetch("/api/connections/pending"),
                apiFetch("/api/connections/sent"),
                apiFetch("/api/users/connections")
            ]);

            const [receivedData, sentData, connectionsData] = await Promise.all([
                receivedRes.json(),
                sentRes.json(),
                connectionsRes.json()
            ]);

            if (receivedData.success) setReceived(receivedData.data);
            if (sentData.success) setSent(sentData.data);
            if (connectionsData.success) setConnections(connectionsData.connections);
        } catch (error) {
            console.error("Scale Error:", error);
            toast.error("Failed to sync network data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!user?.id || !token) return;
        const socket = initSocket(token, user.id);
        
        const handleUpdate = () => {
            fetchData();
        };

        socket.on(`connection_update_${user.id}`, handleUpdate);
        socket.on(`notification_${user.id}`, handleUpdate);

        return () => {
            socket.off(`connection_update_${user.id}`, handleUpdate);
            socket.off(`notification_${user.id}`, handleUpdate);
        };
    }, [user?.id, token, fetchData]);

    const handleRespond = async (id: string, status: "ACCEPTED" | "REJECTED") => {
        setProcessingId(id);
        try {
            const res = await apiFetch(`/api/connections/respond/${id}`, {
                method: "PUT",
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(status === "ACCEPTED" ? "Network access granted" : "Request declined");
                fetchData();
            }
        } catch (error) {
            toast.error("Anomalous response intercepted");
        } finally {
            setProcessingId(null);
        }
    };

    const handleCancel = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await apiFetch(`/api/connections/cancel/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Transmission aborted");
                fetchData();
            }
        } catch (error) {
            toast.error("Abort sequence failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemove = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await apiFetch(`/api/connections/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (data.success) {
                toast.success("Connection dissolved");
                fetchData();
            }
        } catch (error) {
            toast.error("Termination error");
        } finally {
            setProcessingId(null);
        }
    };

    const EmptyState = ({ type }: { type: string }) => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-white/50 border border-dashed border-slate-200 rounded-[2.5rem] mt-4"
        >
            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-300">
                {type === "received" ? <Inbox size={32} /> : type === "sent" ? <Send size={32} /> : <Users size={32} />}
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    {type === "received" ? "No new requests" : type === "sent" ? "No sent requests" : "No connections yet"}
                </h3>
                <p className="text-xs font-medium text-slate-400 max-w-[200px] mx-auto leading-relaxed italic">
                    {type === "received" ? "You're all caught up! New requests will appear here." : type === "sent" ? "You haven't sent any requests yet." : "Start building your network by exploring profiles."}
                </p>
            </div>
            <Button variant="outline" className="h-10 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest border-slate-200" asChild>
                <Link href="/dashboard/discover">Find People to Connect</Link>
            </Button>
        </motion.div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Supercharged Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-black text-[8px] tracking-[0.2em] uppercase px-2 h-5">
                            MY NETWORK
                        </Badge>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-1">
                            <Clock size={10} /> UP TO DATE
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">Manage <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">Connections</span></h1>
                    <p className="text-sm font-bold text-slate-400 max-w-lg leading-relaxed italic">
                        Keep track of your professional relationships and manage incoming requests.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search your network..."
                            className="pl-11 h-12 w-[300px] rounded-2xl bg-white border-slate-100 shadow-sm font-bold text-xs focus:ring-4 focus:ring-indigo-50 transition-all italic"
                        />
                    </div>
                </div>
            </div>

            <Tabs defaultValue="received" value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-px mb-8 overflow-x-auto no-scrollbar">
                    <TabsList className="bg-transparent h-auto p-0 gap-8">
                        {[
                            { value: "received", label: "Received", count: received.length, icon: Inbox },
                            { value: "sent", label: "Sent", count: sent.length, icon: Send },
                            { value: "connections", label: "Connections", count: connections.length, icon: Users },
                        ].map((tab) => (
                            <TabsTrigger 
                                key={tab.value}
                                value={tab.value}
                                className={cn(
                                    "relative h-12 px-0 bg-transparent rounded-none border-b-2 border-transparent transition-all",
                                    "data-[state=active]:bg-transparent data-[state=active]:border-indigo-600 data-[state=active]:shadow-none group"
                                )}
                            >
                                <div className="flex items-center gap-2 px-1">
                                    <tab.icon size={14} className={cn(
                                        "transition-colors",
                                        activeTab === tab.value ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                                    )} />
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-[0.15em] transition-colors",
                                        activeTab === tab.value ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                                    )}>
                                        {tab.label}
                                    </span>
                                    {tab.count > 0 && (
                                        <Badge className={cn(
                                            "h-5 min-w-[20px] rounded-full border-none font-black text-[9px] flex items-center justify-center p-0 px-1.5 transition-all shadow-sm",
                                            activeTab === tab.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {tab.count}
                                        </Badge>
                                    )}
                                </div>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">
                            <Filter size={12} className="mr-1.5" /> Filter
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600" onClick={fetchData}>
                            Refresh
                        </Button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="outline-none"
                    >
                        {activeTab === "received" && (
                            received.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {received.map((req, idx) => (
                                        <ConnectionCard 
                                            key={req._id || `received-${idx}`}
                                            id={req._id}
                                            user={req.sender}
                                            message={req.message}
                                            type="incoming"
                                            isProcessing={processingId === req._id}
                                            onAccept={() => handleRespond(req._id, "ACCEPTED")}
                                            onReject={() => handleRespond(req._id, "REJECTED")}
                                            delay={idx * 0.05}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState type="received" />
                            )
                        )}

                        {activeTab === "sent" && (
                            sent.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sent.map((req, idx) => (
                                        <ConnectionCard 
                                            key={req._id || `sent-${idx}`}
                                            id={req._id}
                                            user={req.recipient}
                                            status="PENDING"
                                            type="outgoing"
                                            isProcessing={processingId === req._id}
                                            onCancel={() => handleCancel(req._id)}
                                            delay={idx * 0.05}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState type="sent" />
                            )
                        )}

                        {activeTab === "connections" && (
                            connections.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {connections.map((conn, idx) => (
                                        <ConnectionCard 
                                            key={(conn.connectionId || conn._id) || `conn-${idx}`}
                                            id={conn.connectionId || conn._id}
                                            user={conn}
                                            type="connected"
                                            isProcessing={processingId === (conn.connectionId || conn._id)}
                                            onRemove={() => handleRemove(conn.connectionId || conn._id)}
                                            delay={idx * 0.05}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState type="connections" />
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}

function ConnectionCard({ 
    id, 
    user, 
    message, 
    status, 
    type, 
    isProcessing, 
    onAccept, 
    onReject, 
    onCancel, 
    onRemove,
    delay = 0 
}: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -mr-16 -mt-16" />
            
            <div className="relative z-10 space-y-5">
                <div className="flex items-start justify-between">
                    <div className="relative">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 overflow-hidden shadow-inner group-hover:bg-indigo-600 transition-all duration-500 flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={user.name} />
                            ) : (
                                <span className="text-xl font-black text-slate-300 group-hover:text-white uppercase transition-colors italic">{user?.name?.charAt(0) || '?'}</span>
                            )}
                        </div>
                        <Badge className="absolute -bottom-2 -right-2 h-7 w-7 rounded-lg bg-emerald-500 border-4 border-white text-white p-0 flex items-center justify-center shadow-lg">
                            <ShieldCheck size={14} />
                        </Badge>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        {type === "incoming" && (
                            <Badge className="bg-orange-50 text-orange-600 border-none font-black text-[8px] tracking-[0.1em] uppercase px-2 h-5 flex items-center gap-1 italic">
                               <Inbox size={10} /> NEW REQUEST
                            </Badge>
                        )}
                        {type === "outgoing" && (
                             <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] tracking-[0.1em] uppercase px-2 h-5 flex items-center gap-1 italic">
                             <Send size={10} /> QUEUED
                          </Badge>
                        )}
                        {type === "connected" && (
                            <div className="flex flex-col items-end gap-1.5">
                                <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] tracking-[0.1em] uppercase px-2 h-5 flex items-center gap-1 italic">
                                    <Users size={10} /> CONNECTED
                                </Badge>
                                {(user.unreadCount ?? 0) > 0 && (
                                    <Badge className="bg-indigo-600 text-white border-none font-black text-[8px] px-1.5 h-4 flex items-center justify-center animate-bounce">
                                        {user.unreadCount} NEW
                                    </Badge>
                                )}
                            </div>
                        )}
                        <span className="text-[7.5px] font-black text-slate-300 uppercase tracking-widest">{type === 'incoming' ? 'INCOMING' : 'ONLINE'}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 tracking-tight italic group-hover:text-indigo-600 transition-colors">{user?.name || "Unknown User"}</h3>
                        <ArrowUpRight size={14} className="text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none h-4 opacity-70 italic">
                        {user?.role || "ACCESS RESTRICTED"} <span className="mx-1 text-slate-200">•</span> VERIFIED USER
                    </p>
                </div>

                {(message || user?.bio) && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-50/50 text-[11px] font-bold text-slate-500 leading-relaxed italic line-clamp-2 min-h-[54px] transition-all group-hover:bg-indigo-50/30">
                        "{message || user?.bio || "No intro message provided."}"
                    </div>
                )}

                <div className="pt-2">
                    {type === "incoming" ? (
                        <div className="flex gap-2">
                            <Button 
                                className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all border-none"
                                onClick={onAccept}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : "ACCEPT"}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="flex-1 h-11 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                                onClick={onReject}
                                disabled={isProcessing}
                            >
                                DECLINE
                            </Button>
                        </div>
                    ) : type === "outgoing" ? (
                        <Button 
                            variant="outline" 
                            className="w-full h-11 border-dashed border-red-100 text-red-400 hover:bg-red-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all gap-2"
                            onClick={onCancel}
                            disabled={isProcessing}
                        >
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <><Trash2 size={14} /> CANCEL REQUEST</>}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button 
                                className="flex-1 h-11 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all gap-2"
                                asChild
                            >
                                <Link href={`/dashboard/chat?id=${user.conversationId || ''}`}>
                                    <MessageSquare size={14} /> CHAT
                                </Link>
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-11 w-11 p-0 border-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                onClick={onRemove}
                                disabled={isProcessing}
                            >
                                <UserMinus size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
