"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Building2, MessageSquare, Calendar, ShieldCheck, Mail, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { ConnectionButton } from "@/components/discover/ConnectionButton";
import { toast } from "sonner";

interface Connection {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    connectionId: string;
    connectedAt: string;
    email: string;
    status: string;
}

export default function ConnectionsPage() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([fetchConnections(), fetchPending()]);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchConnections = async () => {
        try {
            const response = await apiFetch("/api/users/connections");
            const data = await response.json();
            if (data.success) setConnections(data.connections);
        } catch (error) {}
    };

    const fetchPending = async () => {
        try {
            const response = await apiFetch("/api/connections/pending");
            const data = await response.json();
            if (data.success) setPendingRequests(data.data || []);
        } catch (error) {}
    };

    const handleAccept = async (connId: string, userId: string) => {
        setProcessingId(userId);
        try {
            const res = await apiFetch(`/api/connections/respond/${connId}`, {
                method: "PUT",
                body: JSON.stringify({ status: "ACCEPTED" }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Connection accepted!");
                fetchData();
            }
        } catch (error) {} finally { setProcessingId(null); }
    };

    const handleReject = async (connId: string, userId: string) => {
        setProcessingId(userId);
        try {
            const res = await apiFetch(`/api/connections/respond/${connId}`, {
                method: "PUT",
                body: JSON.stringify({ status: "REJECTED" }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Connection rejected.");
                fetchData();
            }
        } catch (error) {} finally { setProcessingId(null); }
    };

    const filtered = connections.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="space-y-4">
            {/* Ultra-Dense Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1 border-b border-slate-50">
               <div className="flex items-center gap-4">
                  <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Your Connections</h1>
                  <div className="flex items-center gap-4 text-slate-400">
                     <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest">Active:</span>
                        <span className="text-[11px] font-black text-slate-700">{connections.length}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-orange-400">Pending:</span>
                        <span className="text-[11px] font-black text-slate-700">{pendingRequests.length}</span>
                     </div>
                  </div>
               </div>
               
               <div className="relative w-full max-w-xs group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
                    <input 
                        placeholder="Search your network..." 
                        className="pl-9 h-8 w-full bg-white border border-slate-100 rounded-lg shadow-sm text-[10px] font-bold outline-none focus:border-indigo-100 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Pending Requests - Tighter */}
            {pendingRequests.length > 0 && (
                <div className="bg-orange-50/30 p-4 rounded-xl border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-orange-900/60">Action Required</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {pendingRequests.map((req) => (
                            <div key={req._id} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 min-w-0">
                                   <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-xs shrink-0">
                                       {req.sender?.name?.charAt(0)}
                                   </div>
                                   <div className="min-w-0">
                                      <h3 className="font-black text-slate-900 text-[11px] truncate leading-tight">{req.sender?.name}</h3>
                                      <p className="text-[7.5px] uppercase tracking-widest font-bold text-slate-400 truncate">{req.sender?.role}</p>
                                   </div>
                                </div>
                                <div className="flex gap-1.5">
                                   <Button className="h-6 w-6 p-0 bg-indigo-600 text-white rounded" onClick={() => handleAccept(req._id, req.sender?._id)}>✓</Button>
                                   <Button variant="ghost" className="h-6 w-6 p-0 text-slate-400 rounded" onClick={() => handleReject(req._id, req.sender?._id)}>×</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Network List - Dense Grid */}
            <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                    <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-400">Verified Connections</h3>
                    <Badge className="bg-slate-50 text-slate-400 border-none font-bold text-[7.5px] px-1.5 h-4">Sync 100%</Badge>
                </div>

                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filtered.map((conn) => (
                            <div key={conn.connectionId} className="group bg-white border border-slate-100 shadow-sm hover:border-indigo-100 transition-all rounded-xl p-3 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="h-10 w-10 rounded bg-slate-50 flex items-center justify-center border border-slate-50 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner shrink-0">
                                        {conn.role === "investor" ? <User size={18} /> : <Building2 size={18} />}
                                    </div>
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] font-black tracking-widest h-4 px-1 rounded flex items-center gap-1">
                                        <ShieldCheck size={9} fill="currentColor" /> VERIFIED
                                    </Badge>
                                </div>
                                
                                <div className="space-y-0.5 mb-3 min-h-[32px]">
                                    <h3 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 truncate transition-colors leading-tight">{conn.name}</h3>
                                    <p className="text-[7.5px] font-black uppercase text-slate-400 tracking-wider h-3 italic truncate"> {conn.role} </p>
                                </div>

                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-50/50 mb-3 text-[9.5px] text-slate-500 font-bold overflow-hidden truncate italic opacity-80">
                                    {conn.email}
                                </div>

                                <div className="mt-auto flex gap-2">
                                    <Button className="flex-1 h-7 bg-slate-900 hover:bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-md" asChild>
                                        <Link href="/dashboard/chat">Message</Link>
                                    </Button>
                                    <Button variant="outline" className="flex-1 h-7 text-[8px] font-black uppercase tracking-widest border-slate-100 rounded-md text-slate-500" asChild>
                                        <Link href="/dashboard/meetings">Meet</Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && (
                        <div className="py-12 text-center bg-white rounded-xl border border-dashed border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900">Isolation Detected</h3>
                            <p className="text-[9px] text-slate-400 font-medium px-4 mt-1 italic">No verified connections found. Link with users in Discover.</p>
                            <Button className="mt-4 bg-indigo-600 h-8 px-4 rounded-lg font-bold uppercase text-[9px]" asChild><Link href="/dashboard/discover">Discover</Link></Button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
