"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, 
    Zap,
    Loader2,
    CheckCircle2,
    ArrowUpRight
} from "lucide-react";

import { apiFetchJSON } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SmartMatchSectionProps {
    userRole: "startup" | "investor";
    search?: string;
    filters?: {
        industry: string;
        location: string;
        stage: string;
    };
    onActionTaken?: () => void;
}

export default function SmartMatchSection({ userRole, search = "", filters, onActionTaken }: SmartMatchSectionProps) {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDataNotice, setNewDataNotice] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [connectingId, setConnectingId] = useState<string | null>(null);
    const isMounted = useRef(true);

    const fetchMatches = useCallback(async (p = 1, isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            // Fetch matched records (Already restricted to registered users in backend)
            const data = await apiFetchJSON(`/api/match/me?page=${p}&limit=8`);
            
            if (isMounted.current && data.success) {
                setTotalPages(data.pages || 1);
                setCurrentPage(data.page || 1);
                const formatted = data.data.map((item: any) => {
                    const profile = userRole === "startup" ? item.investor : item.startup;
                    return {
                        id: profile._id || profile.id,
                        name: profile.investorName || profile.startupName || profile.founderName || "Not specified",
                        company: profile.firmName || profile.startupName || "Not specified",
                        type: profile.investorName ? "investor" : "startup",
                        score: item.score || 0,
                        industry: profile.industry || (profile.preferredIndustries ? profile.preferredIndustries[0] : "Not specified"),
                        stage: profile.stage || (profile.preferredStages ? profile.preferredStages[0] : "Not specified"),
                        location: profile.location || "Not specified",
                        description: profile.description || profile.bio || "Not specified",
                        email: profile.userId?.email || profile.email || "Not specified",
                        linkedinUrl: profile.linkedinUrl || profile.socialLinks?.linkedin || null,
                        source: "registered", // Strict data filter requirement
                        lastActive: profile.userId?.lastLogin ? new Date(profile.userId.lastLogin).toLocaleDateString() : "Offline",
                        reasons: item.reasons || [],
                        connectionStatus: item.connectionStatus || "NONE",
                        connectionId: item.connectionId || null
                    };
                });

                // Debug Log Requirement
                console.log("Registered Users:", formatted);
                console.log("External Data:", "Skipped (Strict Separation Mode)");

                setMatches(prevMatches => {
                    if (isBackground && prevMatches.length > 0) {
                        const prevIds = new Set(prevMatches.map((m: any) => m.id));
                        const hasNew = formatted.some((m: any) => !prevIds.has(m.id));
                        if (hasNew || formatted.length !== prevMatches.length) {
                            setNewDataNotice(true);
                            setTimeout(() => {
                                if (isMounted.current) setNewDataNotice(false);
                            }, 4000);
                        }
                    }
                    return formatted;
                });
            }
        } catch (err) {
            console.error("Match fetch failed:", err);
        } finally {
            if (isMounted.current && !isBackground) setLoading(false);
        }
    }, [userRole]);

    const handleConnect = async (profileId: string) => {
        setConnectingId(profileId);
        try {
            const data = await apiFetchJSON("/api/users/connect", {
                method: "POST",
                body: JSON.stringify({ 
                    recipientId: profileId,
                    message: "Hi, I'd like to connect and discuss potential opportunities."
                })
            });

            if (data.success) {
                if (onActionTaken) onActionTaken();
                setMatches(prev => prev.map(m => m.id === profileId ? { ...m, connectionStatus: "PENDING" } : m));
            } else {
                alert(data.message || "Failed to send request");
            }
        } catch (err) {
            console.error("Connection failed:", err);
        } finally {
            setConnectingId(null);
        }
    };

    const handleAccept = async (connectionId: string, profileId: string) => {
        setConnectingId(profileId);
        try {
            const data = await apiFetchJSON(`/api/users/connect/${connectionId}`, {
                method: "PUT",
                body: JSON.stringify({ status: "ACCEPTED" }),
            });
            if (data.success) {
                setMatches(prev => prev.map(m => m.id === profileId ? { ...m, connectionStatus: "ACCEPTED" } : m));
                if (onActionTaken) onActionTaken();
            }
        } catch (err) {
            console.error("Accept failed:", err);
        } finally {
            setConnectingId(null);
        }
    };

    const handleReject = async (connectionId: string, profileId: string) => {
        setConnectingId(profileId);
        try {
            const data = await apiFetchJSON(`/api/users/connect/${connectionId}`, {
                method: "PUT",
                body: JSON.stringify({ status: "REJECTED" }),
            });
            if (data.success) {
                setMatches(prev => prev.map(m => m.id === profileId ? { ...m, connectionStatus: "REJECTED_RECENT" } : m));
                setTimeout(() => {
                    setMatches(prev => prev.map(m => m.id === profileId ? { ...m, connectionStatus: "NONE" } : m));
                }, 3000);
            }
        } catch (err) {
            console.error("Reject failed:", err);
        } finally {
            setConnectingId(null);
        }
    };

    useEffect(() => {
        isMounted.current = true;
        fetchMatches(1);
        return () => { isMounted.current = false; };
    }, [fetchMatches]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isMounted.current) fetchMatches(currentPage, true);
        }, 30000);
        
        return () => clearInterval(intervalId);
    }, [fetchMatches, currentPage]);

    // Client-side filtering for Smart Matches
    const filteredMatches = matches.filter(item => {
        const matchesSearch = !search || 
            item.name.toLowerCase().includes(search.toLowerCase()) || 
            item.company.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
        
        const matchesIndustry = !filters || filters.industry === "All Industries" || filters.industry === "All" ||
            item.industry?.toLowerCase().includes(filters.industry.toLowerCase());
            
        const matchesLocation = !filters || !filters.location ||
            item.location?.toLowerCase().includes(filters.location.toLowerCase());

        return matchesSearch && matchesIndustry && matchesLocation;
    });

    return (
        <div className="space-y-12 relative">
            <AnimatePresence>
                {newDataNotice && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-8 left-1/2 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg shadow-primary/20 font-medium text-sm flex items-center gap-2"
                    >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        New matches available
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Zap className="text-primary h-4 w-4" fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Matches</h2>
                    </div>
                    <p className="text-slate-500 font-medium">Verified individuals from our proprietary member network.</p>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-96 bg-slate-100/50 rounded-[2.5rem] animate-pulse" />
                    ))}
                </div>
            ) : filteredMatches.length === 0 ? (
                <div className="py-24 text-center space-y-6 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 mx-auto max-w-4xl shadow-sm">
                    <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                        <Zap className="text-primary/40" size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">No smart matches found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">Matches appear in this section once users register on the platform.</p>
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200">Improve My Profile</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredMatches.map((item, idx) => (
                        <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="rounded-[2.5rem] border-slate-200 bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden group border focus-within:ring-2 focus-within:ring-primary/20 h-full flex flex-col">
                                <CardContent className="p-8 flex-1 flex flex-col">
                                    {/* Match Score Badge */}
                                    <div className="flex justify-between items-center mb-8">
                                        <div className="flex items-center gap-2">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <Zap size={18} className="text-primary" fill="currentColor" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Match Score</p>
                                                <p className="text-sm font-black text-primary italic">{item.score}% Match</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-500 hover:bg-primary transition-colors hover:text-white border-none px-3 py-1 font-bold text-[10px] rounded-full uppercase tracking-tighter">
                                            Verified Member
                                        </Badge>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-2xl shadow-lg shadow-primary/5">
                                                {item.name ? item.name.charAt(0) : "?"}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.name || "Not specified"}</h3>
                                                <p className="text-sm font-bold text-slate-400 mt-0.5">{item.company || "Not specified"}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-600 border-none px-2 py-1 text-[9px] font-bold uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-colors">
                                            {item.source}
                                        </Badge>
                                    </div>

                                    {/* Lead Metadata Grid */}
                                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-50 mb-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                                            <p className="text-xs font-bold text-slate-800 truncate capitalize">{item.type}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{item.industry}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stage</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{item.stage}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{item.location}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Info (if available) */}
                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">Email</span>
                                            <span className="text-xs font-medium">{item.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-16">Links</span>
                                            <span className="text-xs font-medium truncate max-w-[180px]">{item.linkedinUrl ? "LinkedIn Verified" : "Not specified"}</span>
                                        </div>
                                    </div>

                                    {/* Footer Stats & Actions */}
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <Clock size={12} /> Last Active
                                            </div>
                                            <p className={cn(
                                                "text-xs font-bold",
                                                item.lastActive !== "Offline" ? "text-slate-600" : "text-slate-400 font-medium"
                                            )}>
                                                {item.lastActive}
                                            </p>
                                        </div>
                                        
                                         {item.connectionStatus === "ACCEPTED" ? (
                                            <Button disabled className="rounded-xl h-11 px-6 bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-widest border border-emerald-100 italic gap-2">
                                                <CheckCircle2 className="h-4 w-4" /> Connected
                                            </Button>
                                         ) : item.connectionStatus === "RECEIVED_PENDING" ? (
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={() => handleAccept(item.connectionId, item.id)}
                                                    disabled={connectingId === item.id}
                                                    className="rounded-xl h-11 px-4 bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all"
                                                >
                                                    {connectingId === item.id ? <Loader2 className="animate-spin h-3 w-3" /> : "Accept"}
                                                </Button>
                                                <Button 
                                                    onClick={() => handleReject(item.connectionId, item.id)}
                                                    disabled={connectingId === item.id}
                                                    variant="outline"
                                                    className="rounded-xl h-11 px-4 border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                         ) : item.connectionStatus === "REJECTED_RECENT" ? (
                                            <Button disabled className="rounded-xl h-11 px-6 bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-widest border border-rose-100 italic">
                                                Rejected
                                            </Button>
                                         ) : (
                                            <Button 
                                                onClick={() => handleConnect(item.id)}
                                                disabled={connectingId === item.id || item.connectionStatus === "PENDING"}
                                                className="rounded-xl h-11 px-6 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-slate-200/50 disabled:opacity-50"
                                            >
                                                {connectingId === item.id ? (
                                                    <Loader2 className="animate-spin h-4 w-4" />
                                                ) : (
                                                    item.connectionStatus === "PENDING" ? "Pending" : "Connect"
                                                )}
                                            </Button>
                                         )}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchMatches(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="rounded-xl font-bold bg-white text-slate-600 border-slate-200"
                    >
                        Previous
                    </Button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) pageNum = i + 1;
                            else if (currentPage <= 3) pageNum = i + 1;
                            else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                            else pageNum = currentPage - 2 + i;

                            if (pageNum <= 0 || pageNum > totalPages) return null;

                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => fetchMatches(pageNum)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl font-bold transition-all",
                                        currentPage === pageNum ? "bg-primary shadow-lg shadow-primary/20 text-white border-none" : "bg-white text-slate-500"
                                    )}
                                    disabled={loading}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchMatches(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="rounded-xl font-bold bg-white text-slate-600 border-slate-200"
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}
