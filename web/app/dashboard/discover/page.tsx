"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Building2,
    User,
    Users,
    ShieldCheck,
    Globe,
    Sparkles,
    LayoutGrid,
    Layers,
    ChevronRight,
    CircleDashed,
    ArrowRight,
    Target
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscoverStories } from "@/components/discover/DiscoverStories";
import { motion, AnimatePresence } from "framer-motion";
import { HistoryAuditModal } from "@/components/discover/HistoryAuditModal";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConnectionButton } from "@/components/discover/ConnectionButton";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"smart" | "external">("smart");
    const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
    const [externalProfiles, setExternalProfiles] = useState<any[]>([]);
    const [aiMatches, setAiMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(true);
    const [isExternalLoading, setIsExternalLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "stack">("grid");
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [auditData, setAuditData] = useState<any>({ name: "", type: "STARTUP", founder: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                fetchAllData(parsedUser);
            } catch (e) {
                console.error("Error parsing user:", e);
            }
        }
    }, []);

    const fetchAllData = async (currentUser: any) => {
        const role = currentUser.role?.toLowerCase();
        if (!role) return;
        fetchSmartMatches(role);
        fetchAiMatches(role);
        fetchExternalDiscovery(role);
    };

    useEffect(() => {
        if (user) fetchAllData(user);
    }, [searchTerm]);

    const fetchSmartMatches = async (role: string) => {
        setIsLoading(true);
        try {
            const targetType = role === "startup" ? "investor" : "startup";
            const response = await apiFetch(`/api/discover/registered?type=${targetType}&q=${searchTerm}`);
            const data = await response.json();
            if (data.success) setRegisteredUsers(data.data);
        } catch (error) {} finally { setIsLoading(false); }
    };

    const fetchAiMatches = async (role: string) => {
        setIsAiLoading(true);
        try {
            const response = await apiFetch(`/api/ai/${role}`);
            const data = await response.json();
            if (data.success) setAiMatches(data.matches);
        } catch (error) {} finally { setIsAiLoading(false); }
    };

    const fetchExternalDiscovery = async (role: string) => {
        setIsExternalLoading(true);
        try {
            const response = await apiFetch(`/api/external/discovery?limit=100`);
            const data = await response.json();
            if (data.success) setExternalProfiles(data.data || []);
        } catch (error) {} finally { setIsExternalLoading(false); }
    };

    const handleConnect = async (recipientId: string) => {
        setProcessingId(recipientId);
        try {
            const response = await apiFetch("/api/users/connect", {
                method: "POST",
                body: JSON.stringify({ recipientId, message: "Let's connect!" }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Connection request sent!");
                setRegisteredUsers(prev => prev.map(p => {
                    const profileUserId = p.userId?._id || p.userId;
                    return profileUserId === recipientId ? { ...p, connectionStatus: "PENDING" } : p;
                }));
            }
        } catch (error) {} finally { setProcessingId(null); }
    };

    const handleAccept = async (connectionId: string, profileId: string) => {
        setProcessingId(profileId);
        try {
            const response = await apiFetch(`/api/users/connect/${connectionId}`, {
                method: "PUT",
                body: JSON.stringify({ status: "ACCEPTED" }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Connection accepted!");
                setRegisteredUsers(prev => prev.map(p => p.connectionId === connectionId ? { ...p, connectionStatus: "ACCEPTED" } : p));
            }
        } catch (error) {} finally { setProcessingId(null); }
    };

    const handleReject = async (connectionId: string, profileId: string) => {
        setProcessingId(profileId);
        try {
            const response = await apiFetch(`/api/users/connect/${connectionId}`, {
                method: "PUT",
                body: JSON.stringify({ status: "REJECTED" }),
            });
            const data = await response.json();
            if (data.success) {
                toast.info("Request declined");
                setRegisteredUsers(prev => prev.map(p => p.connectionId === connectionId ? { ...p, connectionStatus: "NONE" } : p));
            }
        } catch (error) {} finally { setProcessingId(null); }
    };

    const visibleExternal = externalProfiles.filter(item => {
        const userRole = (user?.role || "").toUpperCase();
        const itemType = (item.type || "").toUpperCase();
        
        // Show opposite type (Investors for Startups, vice-versa)
        const matchesRole = userRole === "STARTUP" ? itemType === "INVESTOR" : itemType === "STARTUP";
        
        const name = (item.name || item.firm || "").toLowerCase();
        return matchesRole && name.includes(searchTerm.toLowerCase());
    });

    const visibleRegistered = registeredUsers.filter(item => {
        const userRole = (user?.role || "").toUpperCase();
        const itemRole = (item.role || "").toUpperCase();

        const matchesRole = userRole === "STARTUP" ? itemRole === "INVESTOR" : itemRole === "STARTUP";
        const name = (item.companyName || item.firmName || item.userId?.name || "").toLowerCase();
        const profileId = item.userId?._id || item.userId;
        const isNotMe = profileId !== user?.id && profileId !== user?._id;
        return matchesRole && name.includes(searchTerm.toLowerCase()) && isNotMe;
    });

    // STEP 5 — RENDER COUNT TRACKING
    useEffect(() => {
        if (!isLoading && !isExternalLoading) {
            const count = activeTab === "smart" ? visibleRegistered.length : visibleExternal.length;
            console.log(`📊 [UI Render] Total records rendered in ${activeTab}:`, count);
            
            // Log to backend for verification (Silent ping)
            if (count > 0) {
                apiFetch("/api/debug/log-render-count", {
                    method: "POST",
                    body: JSON.stringify({ 
                        tab: activeTab, 
                        renderCount: count,
                        userId: user?.id 
                    })
                }).catch(() => {});
            }
        }
    }, [visibleExternal.length, visibleRegistered.length, activeTab, isLoading, isExternalLoading]);

    if (!user) return null;

    return (
        <div className="space-y-4">
            {/* Top Discovery Flow - Stories / Pulses */}
            <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                <DiscoverStories />
            </div>

            {/* Combined Toolbar / Navigation Row */}
            <div className="flex items-center justify-between gap-4 py-2">
                <div className="flex items-center gap-1.5 p-1 bg-slate-50/80 rounded-full border border-slate-100/50 shadow-sm shrink-0">
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-8 px-4 rounded-full font-bold text-[9px] uppercase tracking-[0.15em] transition-all flex items-center gap-2",
                            activeTab === "smart" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                        onClick={() => setActiveTab("smart")}
                    >
                        <Sparkles size={11} className={cn(activeTab === "smart" ? "text-indigo-600" : "text-slate-400")} /> 
                        Smart Matches
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-8 px-4 rounded-full font-bold text-[9px] uppercase tracking-[0.15em] transition-all flex items-center gap-2",
                            activeTab === "external" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                        )}
                        onClick={() => setActiveTab("external")}
                    >
                        <Globe size={11} className={cn(activeTab === "external" ? "text-indigo-600" : "text-slate-400")} />
                        Global Network
                    </Button>
                </div>

                <div className="flex-1 flex items-center gap-3 max-w-xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                        <Input
                            placeholder={`Search global market...`}
                            className="pl-10 h-10 bg-white border-slate-100 rounded-full text-[10.5px] font-bold shadow-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-200 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1.5 p-1 bg-slate-50 rounded-full border border-slate-100">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={13} className={viewMode === 'grid' ? "text-indigo-600" : "text-slate-400"} />
                        </Button>
                        <Button variant={viewMode === 'stack' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={() => setViewMode('stack')}>
                            <Layers size={13} className={viewMode === 'stack' ? "text-indigo-600" : "text-slate-400"} />
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "smart" ? (
                    <motion.div key="smart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">All Registered Startups</h2>
                            <Badge className="bg-slate-50 text-slate-400 border-none font-bold text-[8px] px-2 py-0">Verified Only</Badge>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-white border border-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {visibleRegistered.map((item) => (
                                    <div key={item._id} className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all">
                                        <div className="flex justify-between mb-4">
                                            <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                {user?.role === "STARTUP" ? <Building2 size={18} /> : <User size={18} />}
                                            </div>
                                            <div className="flex gap-1">
                                                <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7.5px] font-black uppercase tracking-widest h-5 px-1.5 flex items-center gap-1">
                                                    <ShieldCheck size={10} /> VERIFIED
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="space-y-1 mb-4 min-h-[40px]">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.companyName || item.userId?.name}</h4>
                                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider italic">{item.industry || "Target Member"}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-50 mb-4 h-16 overflow-hidden">
                                           <p className="text-[10px] text-slate-500 font-medium line-clamp-2 italic leading-relaxed">{item.description || item.bio || "Active member of the investment network."}</p>
                                        </div>
                                        <div className="space-y-2 mt-auto">
                                            <ConnectionButton
                                                status={item.connectionStatus}
                                                onConnect={() => handleConnect(item.userId?._id || item.userId)}
                                                onAccept={() => handleAccept(item.connectionId, item.userId?._id || item.userId)}
                                                onReject={() => handleReject(item.connectionId, item.userId?._id || item.userId)}
                                                isLoading={processingId === (item.userId?._id || item.userId)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="external" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Standardized Header */}
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Aggregated Global Leads</h2>
                            <Badge className="bg-slate-900 text-white border-none font-bold text-[8px] px-2 py-0">Global Market</Badge>
                        </div>

                        {isExternalLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-white border border-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {visibleExternal.map((item, i) => (
                                    <div key={item._id || i} className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all flex flex-col">
                                        <div className="flex justify-between mb-4">
                                            <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-200">
                                                {item.logo ? <img src={item.logo} alt="" className="w-full h-full object-cover" /> : <Target size={18} className="text-slate-300" />}
                                            </div>
                                            <Badge className="bg-slate-900 text-white border-none font-black text-[7.5px] h-5 px-1.5 flex items-center gap-1 uppercase tracking-widest">
                                                {item.source || "External"}
                                            </Badge>
                                        </div>
                                        <div className="space-y-1 mb-4 min-h-[40px]">
                                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.name || item.firm}</h4>
                                            <p className="text-[8px] font-black uppercase text-indigo-400 tracking-wider italic">#{item.industry || "General Opportunity"}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-50 mb-4 h-16 overflow-hidden">
                                           <p className="text-[10px] text-slate-500 font-medium line-clamp-2 italic leading-relaxed">{item.description || "Institutional intelligence data from verified network."}</p>
                                        </div>
                                        <div className="mt-auto">
                                            <Button 
                                                className="w-full h-9 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-sm transition-all" 
                                                onClick={() => window.open(item.website, "_blank")}
                                            >
                                                Connect <ArrowRight size={11} className="ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <HistoryAuditModal
                isOpen={isAuditOpen}
                onClose={() => setIsAuditOpen(false)}
                entityName={auditData.name}
                entityType={auditData.type}
                founderName={auditData.founder}
            />
        </div>
    );
}

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><CircleDashed size={24} className="animate-spin text-indigo-600" /></div>}>
            <DiscoverContent />
        </Suspense>
    );
}
