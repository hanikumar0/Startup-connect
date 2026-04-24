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
    Mail,
    TrendingUp
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
import { IntelligenceCard } from "@/components/intelligence/IntelligenceCard";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const { user, _hasHydrated } = useAuthStore();
    const [activeTab, setActiveTab] = useState<"smart" | "external">("smart");
    const [searchTab, setSearchTab] = useState<"all" | "internal" | "global">("all");
    const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
    const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<{ internal: any[], global: any[], intelligence: any[] }>({ internal: [], global: [], intelligence: [] });
    const [networkType, setNetworkType] = useState<string>("");
    const [networkCount, setNetworkCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isNetworkLoading, setIsNetworkLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<"grid" | "stack">("grid");
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
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
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (user) {
            setCurrentPage(1);
            if (debouncedSearch) {
                handleGlobalSearch(debouncedSearch);
            } else {
                fetchAllData(user);
            }
        }
    }, [debouncedSearch, activeTab]);

    const handleGlobalSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const response = await apiFetch(`/api/discover/search?q=${query}`);
            const data = await response.json();
            if (data.success) {
                setSearchResults({
                    internal: data.data.internal.prioritized || [],
                    global: data.data.external || [],
                    intelligence: data.data.intelligence || []
                });
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };


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
        const userRole = (user?.role || "STARTUP").toUpperCase();
        let itemType = (item.type || "").toUpperCase();
        
        // Safety: ensure no role contamination in network tab
        if (["VC", "ANGEL", "FIRM", "INVESTOR"].includes(itemType)) itemType = "INVESTOR";
        if (["STARTUP", "FOUNDER", "COMPANY"].includes(itemType)) itemType = "STARTUP";
        
        const isOppositeRole = userRole === "STARTUP" ? itemType === "INVESTOR" : itemType === "STARTUP";
        const name = (item.name || item.firm || item.companyName || "").toLowerCase();
        
        return isOppositeRole && name.includes(searchTerm.toLowerCase());
    });

    const visibleRegistered = registeredUsers.filter(item => {
        const userRole = (user?.role || "STARTUP").toUpperCase();
        // Item role can be 'role' (internal models) or 'type' (external models)
        let itemRole = (item.role || item.type || "STARTUP").toUpperCase();
        
        // Safety: If it's something like 'VC' or 'ANGEL', it's an INVESTOR
        if (["VC", "ANGEL", "FIRM", "INVESTOR"].includes(itemRole)) itemRole = "INVESTOR";
        if (["STARTUP", "FOUNDER", "COMPANY"].includes(itemRole)) itemRole = "STARTUP";

        // Strict Separation Rule: Only show the opposite role
        const isOppositeRole = userRole === "STARTUP" ? itemRole === "INVESTOR" : itemRole === "STARTUP";
        
        const name = (item.companyName || item.firmName || item.name || item.firm || item.userId?.name || "").toLowerCase();
        const profileId = item.userId?._id || item.userId || item._id;
        const isNotMe = profileId !== user?.id;

        return isOppositeRole && name.includes(searchTerm.toLowerCase()) && isNotMe;
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

            {/* New Prominent Search System */}
            <div className="space-y-4">
                <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <Input
                        placeholder="Search startups, investors, mentors, funding..."
                        className="pl-12 h-14 bg-white border-slate-100 rounded-2xl text-sm font-bold shadow-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-200 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => setShowSuggestions(true)}
                    />
                    {isSearching && (
                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                            <CircleDashed className="animate-spin h-4 w-4 text-indigo-600" />
                        </div>
                    )}

                    {/* Search Suggestions Dropdown */}
                    {(showSuggestions && !debouncedSearch && !isSearching) && (
                        <Card className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border-slate-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                             <CardContent className="p-4 space-y-4">
                                <div>
                                    <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-3 px-2">Trending Searches</h5>
                                    <div className="flex flex-wrap gap-2 px-2">
                                        {["Seed Funding", "SaaS Founders", "Fintech India", "AgriTech", "AI Startups"].map(tag => (
                                            <Badge 
                                                key={tag} 
                                                className="bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border-none cursor-pointer px-3 py-1.5 transition-all text-[10px] font-bold"
                                                onClick={() => setSearchTerm(tag)}
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-50">
                                    <h5 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 px-2">Suggested Categories</h5>
                                    {["Institutional Investors", "Angel Networks", "Government Grants", "Accelerators"].map(cat => (
                                        <div 
                                            key={cat} 
                                            className="p-2 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer group"
                                            onClick={() => setSearchTerm(cat)}
                                        >
                                            <span className="text-[11px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{cat}</span>
                                            <ArrowRight size={12} className="text-slate-300 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    ))}
                                </div>
                             </CardContent>
                        </Card>
                    )}
                </div>

                {searchTerm && (
                    <div className="flex items-center gap-2 p-1 bg-slate-50/80 rounded-xl border border-slate-100 w-fit">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                                searchTab === "all" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                            )}
                            onClick={() => setSearchTab("all")}
                        >
                            All Results
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                                searchTab === "internal" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                            )}
                            onClick={() => setSearchTab("internal")}
                        >
                            Internal Matches
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-8 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all",
                                searchTab === "global" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                            )}
                            onClick={() => setSearchTab("global")}
                        >
                            Global Results
                        </Button>
                    </div>
                )}
            </div>

            {/* Existing Context Toolbar - Only shown when NOT searching deeply */}
            {!searchTerm && (
                <div className="flex items-center justify-between gap-4 py-2 border-t border-slate-50 pt-6">
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

                    <div className="flex gap-1.5 p-1 bg-slate-50 rounded-full border border-slate-100">
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={() => setViewMode('grid')}>
                            <LayoutGrid size={13} className={viewMode === 'grid' ? "text-indigo-600" : "text-slate-400"} />
                        </Button>
                        <Button variant={viewMode === 'stack' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7 rounded-full shadow-sm" onClick={() => setViewMode('stack')}>
                            <Layers size={13} className={viewMode === 'stack' ? "text-indigo-600" : "text-slate-400"} />
                        </Button>
                    </div>
                </div>
            )}

            <AnimatePresence mode="wait">
                {searchTerm ? (
                    <motion.div key="search-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {isSearching ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-64 bg-white border border-slate-100 rounded-2xl animate-pulse" />)}
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {((searchTab === "all" || searchTab === "internal") && searchResults.internal.length > 0) && (
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                                                Matching {user?.role?.toUpperCase() === "STARTUP" ? "Investors" : "Startups"}
                                            </h2>
                                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[8px] px-2 py-0">Found: {searchResults.internal.length}</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {searchResults.internal.map((item) => (
                                                <div 
                                                    key={item._id} 
                                                    className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                                                    onClick={() => {
                                                        setSelectedProfile(item);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    <div className="flex justify-between mb-4">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                                            {user?.role === "STARTUP" ? <Target size={20} /> : <Building2 size={20} />}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1">
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[9px] font-bold uppercase tracking-wider h-6 px-2 flex items-center gap-1 shadow-sm">
                                                                <ShieldCheck size={11} /> VERIFIED
                                                            </Badge>
                                                            {item.visibilityScore > 70 && (
                                                                <Badge className="bg-amber-50 text-amber-600 border-none text-[9px] font-bold uppercase tracking-wider h-6 px-2 flex items-center gap-1 shadow-sm">
                                                                    <TrendingUp size={11} /> MOMENTUM
                                                                </Badge>
                                                            )}
                                                            {item.profileScore > 85 && (
                                                                <Badge className="bg-indigo-50 text-indigo-600 border-none text-[9px] font-bold uppercase tracking-wider h-6 px-2 flex items-center gap-1 shadow-sm">
                                                                    ★ ELITE
                                                                </Badge>
                                                            )}
                                                         </div>
                                                    </div>
                                                    <div className="space-y-1 mb-4">
                                                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.companyName || item.firmName || item.userId?.name}</h4>
                                                        <p className="text-[11px] font-semibold uppercase text-indigo-400 tracking-wide">#{item.industry || "Match Found"}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100/50 mb-5 min-h-[70px]">
                                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3 italic">"{item.description || item.bio || "Active platform member ready for collaboration."}"</p>
                                                    </div>

                                                    {/* Intelligence Bar */}
                                                    <div className="mb-5 space-y-1">
                                                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                           <span>Profile Authority</span>
                                                           <span>{item.profileScore || 0}%</span>
                                                       </div>
                                                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                           <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${item.profileScore || 0}%` }} />
                                                       </div>
                                                    </div>

                                                    <ConnectionButton
                                                        status={item.connectionStatus}
                                                        conversationId={item.conversationId}
                                                        onConnect={() => handleConnect(item.userId?._id || item.userId)}
                                                        onAccept={() => handleAccept(item.connectionId, item.userId?._id || item.userId)}
                                                        onReject={() => handleReject(item.connectionId, item.userId?._id || item.userId)}
                                                        isLoading={processingId === (item.userId?._id || item.userId)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {(searchResults.intelligence && searchResults.intelligence.length > 0) && (
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-2 pt-4">
                                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Market Intelligence</h2>
                                            <Badge className="bg-indigo-50 text-indigo-600 border-none font-bold text-[9px] px-2 py-0">Updates: {searchResults.intelligence.length}</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {searchResults.intelligence.map((item: any) => (
                                                <IntelligenceCard key={item._id} item={item} />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {((searchTab === "all" || searchTab === "global") && searchResults.global.length > 0) && (
                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-2 pt-4">
                                            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                                Global {user?.role?.toUpperCase() === "STARTUP" ? "Investor" : "Startup"} Results
                                            </h2>
                                            <Badge className="bg-slate-900 text-white border-none font-bold text-[9px] px-2 py-0 uppercase tracking-wider">Imported: {searchResults.global.length}</Badge>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {searchResults.global.map((item, i) => (
                                                <div 
                                                    key={item._id || i} 
                                                    className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col"
                                                    onClick={() => {
                                                        setSelectedProfile(item);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    <div className="flex justify-between mb-4">
                                                        <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-200 shadow-sm">
                                                            {item.logo ? <img src={item.logo} className="w-full h-full object-cover" /> : <Globe size={20} className="text-slate-300" />}
                                                        </div>
                                                        <Badge className="bg-slate-900 text-white border-none text-[9px] font-bold uppercase tracking-wider h-6 px-2 flex items-center gap-1 shadow-md">
                                                            🌎 IMPORTED
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-1 mb-4">
                                                        <h4 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">{item.name || item.firm}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-[11px] font-bold uppercase text-indigo-400 tracking-wide">#{item.industry || "Global Opportunity"}</p>
                                                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                            <p className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">{item.source || "External"}</p>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-50/50 mb-5 min-h-[70px]">
                                                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed line-clamp-3 italic">"{item.description || "Intelligence curated from the global startup and investment dataset."}"</p>
                                                    </div>
                                                    <div className="mt-auto pt-4 border-t border-slate-50">
                                                        <Button className="w-full h-11 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest shadow-lg transition-all">
                                                            View Intel <ChevronRight size={14} className="ml-2" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {(searchResults.internal.length === 0 && searchResults.global.length === 0) && (
                                    <div className="py-32 text-center bg-white border border-dashed border-slate-100 rounded-[32px] space-y-6">
                                        <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search size={32} className="text-slate-200" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-lg font-black text-slate-900 uppercase tracking-tight">No results found for "{searchTerm}"</p>
                                            <p className="text-xs text-slate-400 font-bold italic">Try broadening your search or checking spelling.</p>
                                        </div>
                                        <Button 
                                            variant="outline" 
                                            className="h-12 px-8 rounded-2xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                                            onClick={() => setSearchTerm("")}
                                        >
                                            Clear Search
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="default-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        {activeTab === "smart" ? (
                            <motion.div key="smart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                {/* Section Header */}
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <h2 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                        Available {user?.role?.toUpperCase() === "STARTUP" ? "Investors" : "Startups"}
                                    </h2>
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
