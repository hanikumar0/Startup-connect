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
    Target,
    Linkedin,
    Mail
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
import { useAuthStore } from "@/lib/store";
import { ProfileDetailModal } from "@/components/discover/ProfileDetailModal";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const { user, _hasHydrated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"smart" | "external">("smart");
    const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
    const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
    const [networkType, setNetworkType] = useState<string>("");
    const [networkCount, setNetworkCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isNetworkLoading, setIsNetworkLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "stack">("grid");
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [auditData, setAuditData] = useState<any>({ name: "", type: "STARTUP", founder: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        if (!_hasHydrated || !user) return;
        
        console.log("USER ROLE IDENTIFIED:", user.role); // 🔐 VERIFY AUTH ROLE
        fetchAllData(user);
    }, [_hasHydrated, user]);

    const fetchAllData = async (currentUser: any) => {
        // Normalize role for comparison
        const role = (currentUser.role || "").toString().trim().toLowerCase();
        if (!role) {
            console.warn("User role missing during data fetch initiation.");
            return;
        }
        
        fetchSmartMatches(role);
        fetchNetworkData();
    };

    useEffect(() => {
        if (user) {
            setCurrentPage(1);
            fetchAllData(user);
        }
    }, [searchTerm, activeTab]);

    const fetchSmartMatches = async (role: string) => {
        setIsLoading(true);
        try {
            const targetType = role === "startup" ? "investor" : "startup";
            const response = await apiFetch(`/api/discover/registered?type=${targetType}&q=${searchTerm}`);
            const data = await response.json();
            if (data.success) setRegisteredUsers(data.data);
        } catch (error) { } finally { setIsLoading(false); }
    };

    const fetchNetworkData = async () => {
        setIsNetworkLoading(true);
        try {
            const response = await apiFetch(`/api/network`);
            const data = await response.json();

            // 🧪 DEBUG LOGS (MANDATORY)
            console.log("API RESPONSE:", data);
            console.log("DATA ARRAY:", data.data);

            if (data.success) {
                // 🔥 FORCE FRONTEND FIX (STRICT MAPPING)
                setNetworkProfiles(data.data || []);
                setNetworkType(data.type || "");
                setNetworkCount(data.count || 0);
            }
        } catch (error) {
            console.error("Network fetch error:", error);
        } finally {
            setIsNetworkLoading(false);
        }
    };

    // 🔁 FORCE STATE UPDATE CHECK
    useEffect(() => {
        console.log("UPDATED DATA:", networkProfiles);
    }, [networkProfiles]);

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
        } catch (error) { } finally { setProcessingId(null); }
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
        } catch (error) { } finally { setProcessingId(null); }
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
        } catch (error) { } finally { setProcessingId(null); }
    };

    const filteredNetwork = networkProfiles.filter(item => {
        const name = (item.name || item.firm || item.companyName || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase());
    });

    const visibleRegistered = registeredUsers.filter(item => {
        const userRole = (user?.role || "STARTUP").toUpperCase();
        const itemRole = (item.role || item.type || "").toUpperCase();

        const matchesRole = userRole === "STARTUP" ? itemRole === "INVESTOR" : itemRole === "STARTUP";
        const name = (item.companyName || item.firmName || item.name || item.firm || item.userId?.name || "").toLowerCase();
        const profileId = item.userId?._id || item.userId || item._id;
        const isNotMe = profileId !== user?.id;

        // If it's an external lead coming through smart match, we allow it
        const isExternal = item.isExternalLead || item.isExternal;

        return (matchesRole || isExternal) && name.includes(searchTerm.toLowerCase()) && isNotMe;
    });

    const paginatedRegistered = visibleRegistered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const paginatedNetwork = filteredNetwork.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const totalPages = Math.ceil(
        (activeTab === "smart" ? visibleRegistered.length : filteredNetwork.length) / ITEMS_PER_PAGE
    );

    // STEP 5 — RENDER COUNT TRACKING
    useEffect(() => {
        if (!isLoading && !isNetworkLoading) {
            const count = activeTab === "smart" ? visibleRegistered.length : filteredNetwork.length;
            console.log(`📊 [UI Render] Total records rendered in ${activeTab}:`, count);
        }
    }, [filteredNetwork.length, visibleRegistered.length, activeTab, isLoading, isNetworkLoading]);

    if (!user) return null;

    return (
        <div className="min-h-full pb-20 space-y-6">
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
                                {paginatedRegistered.map((item) => (
                                    <div 
                                        key={item._id} 
                                        className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => {
                                            setSelectedProfile(item);
                                            setIsDetailOpen(true);
                                        }}
                                    >
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
                                                conversationId={item.conversationId}
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

                        {/* Pagination UI for Smart Matches */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Showing {paginatedRegistered.length} of {visibleRegistered.length} records
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="h-8 w-8 p-0 rounded-lg border-slate-100 text-slate-400 hover:text-indigo-600"
                                    >
                                        <ChevronRight className="rotate-180 h-4 w-4" />
                                    </Button>
                                    <div className="px-3 h-8 flex items-center bg-slate-50 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="h-8 w-8 p-0 rounded-lg border-slate-100 text-slate-400 hover:text-indigo-600"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="external" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Standardized Header */}
                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                            <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                Available {networkType.toUpperCase() || "NETWORK"}
                            </h2>
                            <Badge className="bg-slate-900 text-white border-none font-bold text-[8px] px-2 py-0">
                                {networkType ? networkType.charAt(0).toUpperCase() + networkType.slice(1) : "Network"}: {networkCount}
                            </Badge>
                        </div>

                        {isNetworkLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-white border border-slate-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {filteredNetwork.length === 0 ? (
                                    <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No Institutional Data Found in Grid</p>
                                    </div>
                                ) : (
                                    paginatedNetwork.map((item, i) => {
                                        const metadata = item.metadata || {};
                                        const github = item.source === "github" ? `https://github.com/${metadata.owner}/${item.name}` : null;
                                        const linkedin = item.linkedinUrl || metadata.linkedin;
                                        const email = item.email || metadata.email;

                                        return (
                                            <div key={item._id || i} className="group relative bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all flex flex-col">
                                                <div className="flex justify-between mb-4">
                                                    <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-200">
                                                        {item.logo ? (
                                                            <img src={item.logo} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            networkType === "investors" ? <User size={18} className="text-slate-300" /> : <Building2 size={18} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        {linkedin && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 rounded-full bg-slate-50 text-[#0077b5] hover:bg-[#0077b5] hover:text-white"
                                                                onClick={(e) => { e.stopPropagation(); window.open(linkedin, "_blank"); }}
                                                            >
                                                                <Linkedin size={12} />
                                                            </Button>
                                                        )}
                                                        {email && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white"
                                                                onClick={(e) => { e.stopPropagation(); window.open(`mailto:${email}`, "_blank"); }}
                                                            >
                                                                <Mail size={12} />
                                                            </Button>
                                                        )}
                                                        {github && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 rounded-full bg-slate-50 text-slate-900 hover:bg-[#24292e] hover:text-white"
                                                                onClick={(e) => { e.stopPropagation(); window.open(github, "_blank"); }}
                                                            >
                                                                <Github size={12} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-1 mb-4 min-h-[40px]">
                                                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 italic uppercase tracking-tight">{item.name || item.firm}</h4>
                                                    <p className="text-[8px] font-black uppercase text-indigo-400 tracking-wider">#{item.industry || "Market Pulse"}</p>
                                                </div>
                                                <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-50 mb-4 h-16 overflow-hidden">
                                                    <p className="text-[10px] text-slate-500 font-medium line-clamp-2 italic leading-relaxed">{item.description || "Verified institutional intelligence from global discovery dataset."}</p>
                                                </div>
                                                <div className="mt-auto pt-4 border-t border-slate-50">
                                                    <Button
                                                        className="w-full h-10 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm transition-all italic"
                                                        onClick={() => {
                                                            setSelectedProfile(item);
                                                            setIsDetailOpen(true);
                                                        }}
                                                    >
                                                        View Details <ChevronRight size={12} className="ml-1" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Pagination UI for Network Data */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Showing {paginatedNetwork.length} of {filteredNetwork.length} records
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        className="h-8 w-8 p-0 rounded-lg border-slate-100 text-slate-400 hover:text-indigo-600"
                                    >
                                        <ChevronRight className="rotate-180 h-4 w-4" />
                                    </Button>
                                    <div className="px-3 h-8 flex items-center bg-slate-50 rounded-lg text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        className="h-8 w-8 p-0 rounded-lg border-slate-100 text-slate-400 hover:text-indigo-600"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
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
            <ProfileDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                profile={selectedProfile}
                type={networkType === "investors" ? "investor" : "startup"}
            />
        </div>
    );
}

const Github = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
);

export default function DiscoverPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><CircleDashed size={24} className="animate-spin text-indigo-600" /></div>}>
            <DiscoverContent />
        </Suspense>
    );
}
