"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Filter,
    Building2,
    User,
    ShieldCheck,
    ArrowUpRight,
    Loader2,
    Globe,
    Tag,
    CheckCircle2,
    Clock,
    XCircle,
    FileText,
    ExternalLink,
    X,
    Lock as LucideLock,
    Sparkles,
    BrainCircuit,
    Zap,
    Target,
    History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscoverySwipe } from "@/components/discover/DiscoverySwipe";
import { LayoutGrid, Layers } from "lucide-react";
import { DiscoverStories } from "@/components/discover/DiscoverStories";
import { motion } from "framer-motion";
import { TrustRadar } from "@/components/TrustRadar";
import { MatchAnalysisSidebar } from "@/components/discover/MatchAnalysisSidebar";
import { HistoryAuditModal } from "@/components/discover/HistoryAuditModal";
import { apiFetch } from "@/lib/api";

function DiscoverContent() {
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [aiMatches, setAiMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [selectedPitch, setSelectedPitch] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "stack">("grid");
    const [selectedAnalysisProfile, setSelectedAnalysisProfile] = useState<any>(null);
    const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [auditData, setAuditData] = useState<any>({ name: "", type: "STARTUP", founder: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            const roleToFind = parsedUser.role === "STARTUP" ? "INVESTOR" : "STARTUP";
            fetchProfiles(roleToFind);
            fetchAiMatches(parsedUser.role.toLowerCase());
        }
    }, []);

    const fetchAiMatches = async (role: string) => {
        try {
            const response = await apiFetch(`/api/ai/${role}`);
            const data = await response.json();
            if (data.success) {
                setAiMatches(data.matches);
            }
        } catch (error) {
            console.error("Error fetching AI matches:", error);
        } finally {
            setIsAiLoading(false);
        }
    };

    const fetchProfiles = async (roleToFind: string) => {
        try {
            const response = await apiFetch(`/api/users/discover?role=${roleToFind}`);
            const data = await response.json();
            if (data.success) {
                setProfiles(data.profiles);
            }
        } catch (error) {
            console.error("Error fetching discover profiles:", error);
        } finally {
            setIsLoading(false);
        }
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
                alert("Connection request sent!");
                setProfiles(prev => prev.map(p =>
                    p.userId._id === recipientId ? { ...p, connectionStatus: "PENDING" } : p
                ));
            } else {
                alert(data.message || "Failed to send request");
            }
        } catch (error) {
            console.error("Error sending connection request:", error);
            alert("An error occurred while sending the request.");
        } finally {
            setProcessingId(null);
        }
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
                alert("Connection accepted! You can now chat with them.");
                setProfiles(prev => prev.map(p =>
                    p.connectionId === connectionId ? { ...p, connectionStatus: "ACCEPTED" } : p
                ));
                // Update AI matches if any
                setAiMatches(prev => prev.map(m =>
                    m.connectionId === connectionId ? { ...m, connectionStatus: "ACCEPTED" } : m
                ));
            }
        } catch (error) {
            console.error("Error accepting request:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleAddToPipeline = async (investorId: string) => {
        setProcessingId(investorId);
        try {
            const response = await apiFetch("/api/deals", {
                method: "POST",
                body: JSON.stringify({
                    investorId,
                    stage: "PROSPECT",
                    amount: 50000, // Default mock value
                    priority: "MEDIUM"
                }),
            });
            const data = await response.json();
            if (data.success) {
                alert("Investor added to your pipeline!");
            }
        } catch (error) {
            console.error("Error adding to pipeline:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredProfiles = profiles.filter(p => {
        const userId = p.userId?._id?.toString();
        // Check if this profile is already in the AI matches (first 3 shown)
        const isAiMatch = aiMatches.slice(0, 3).some(match =>
            (match.startup?.id?.toString() === userId) ||
            (match.investor?.id?.toString() === userId)
        );

        if (isAiMatch && !searchTerm) return false;

        return (
            (p.companyName || p.firmName || p.userId?.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.industry || p.investorType || "")?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 w-full pt-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center mb-10 mt-6">
                    <div className="relative flex-1 w-full h-11 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                    <div className="h-11 w-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-72 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800" />
                    ))}
                </div>
            </div>
        );
    }

    const roleToFind = user?.role === "STARTUP" ? "Investors" : "Startups";

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Startup Pulse Features */}
            {!searchTerm && <DiscoverStories />}

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder={`Search ${roleToFind.toLowerCase()} by name, industry, or tags...`}
                        className="pl-10 h-11 bg-white border-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 rounded-lg h-9 ${viewMode === "grid" ? "shadow-sm bg-white text-indigo-600" : "text-slate-500 hover:text-indigo-600"}`}
                        onClick={() => setViewMode("grid")}
                    >
                        <LayoutGrid className="h-4 w-4" />
                        Grid
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`gap-2 rounded-lg h-9 ${viewMode === "stack" ? "shadow-sm bg-white text-indigo-600" : "text-slate-500 hover:text-indigo-600"}`}
                        onClick={() => setViewMode("stack")}
                    >
                        <Layers className="h-4 w-4" />
                        Stack
                    </Button>
                </div>
                <Button variant="outline" className="h-11 gap-2 border-slate-200">
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>

            {viewMode === "stack" && !searchTerm ? (
                <div className="py-10">
                    <DiscoverySwipe
                        profiles={profiles}
                        onConnect={handleConnect}
                        isLoading={isLoading}
                        roleToFind={roleToFind}
                    />
                </div>
            ) : (
                <>
                    {/* AI Smart Matches Section */}
                    {!searchTerm && (
                        isAiLoading ? (
                            <div className="space-y-6 animate-in fade-in duration-500 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 animate-pulse rounded-xl" />
                                        <div className="h-6 w-48 bg-indigo-50 dark:bg-indigo-900/30 animate-pulse rounded-md" />
                                    </div>
                                    <div className="h-6 w-32 bg-indigo-50 dark:bg-indigo-900/30 animate-pulse rounded-full" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-64 bg-indigo-50/50 dark:bg-indigo-900/10 animate-pulse rounded-2xl border-2 border-indigo-50 dark:border-indigo-900/20" />
                                    ))}
                                </div>
                                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full my-8" />
                            </div>
                        ) : aiMatches.length > 0 && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-1000">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900">AI Recommended Matches</h2>
                                            <p className="text-sm text-slate-500">Based on your shared vision and market focus.</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 px-3 py-1 gap-1.5">
                                        <BrainCircuit className="h-3 w-3" />
                                        Semantic Analysis Active
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {aiMatches.slice(0, 3).map((match, index) => {
                                        const item = match.startup || match.investor;
                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 24 }}
                                                whileHover={{ y: -8, scale: 1.01 }}
                                                className="h-full"
                                            >
                                                <Card className="relative h-full group border-2 border-indigo-100 shadow-lg shadow-indigo-50 hover:shadow-indigo-500/20 hover:border-indigo-300 transition-all duration-300 overflow-hidden flex flex-col bg-white">
                                                    <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-2">
                                                        <div className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                                                            <Zap className="h-3 w-3" />
                                                            {match.score}% MATCH
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setAuditData({
                                                                    name: item.name || item.firm,
                                                                    type: user?.role === "INVESTOR" ? "STARTUP" : "INVESTOR",
                                                                    founder: item.founder || ""
                                                                });
                                                                setIsAuditOpen(true);
                                                            }}
                                                            className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors"
                                                            title="Deep History Audit"
                                                        >
                                                            <ShieldCheck className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <CardContent className="p-6 flex-1">
                                                        <div className="flex items-start gap-4 mb-4">
                                                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                                {user?.role === "STARTUP" ? <User className="h-6 w-6 text-indigo-600" /> : <Building2 className="h-6 w-6 text-indigo-600" />}
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-900 line-clamp-1">{item.name || item.firm}</h3>
                                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.industry || item.type}</p>
                                                            </div>
                                                        </div>

                                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                                                            <p className="text-xs text-indigo-800 font-semibold mb-1 flex items-center gap-1.5">
                                                                <BrainCircuit className="h-3 w-3" />
                                                                AI Reasoning:
                                                            </p>
                                                            <p className="text-[11px] text-slate-600 italic">
                                                                "{match.reasoning}"
                                                            </p>
                                                        </div>

                                                        <p className="text-sm text-slate-500 line-clamp-2">
                                                            Recognized for strong performance in {item.industry || item.stage} segments.
                                                        </p>
                                                    </CardContent>
                                                    <div className="p-4 pt-0">
                                                        {match.connectionStatus === "ACCEPTED" ? (
                                                            <Button size="sm" variant="outline" className="w-full bg-emerald-50 text-emerald-700 border-emerald-100 gap-2 font-bold cursor-default">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                                Connected
                                                            </Button>
                                                        ) : match.connectionStatus === "PENDING" ? (
                                                            <Button size="sm" disabled className="w-full bg-slate-100 text-slate-400 gap-2 border-none">
                                                                <Clock className="h-4 w-4" />
                                                                Pending
                                                            </Button>
                                                        ) : match.connectionStatus === "RECEIVED_PENDING" ? (
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                                                onClick={() => handleAccept(match.connectionId, item.id)}
                                                                disabled={processingId === item.id}
                                                            >
                                                                {processingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Request"}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                                                                onClick={() => handleConnect(item.id)}
                                                                disabled={processingId === item.id}
                                                            >
                                                                {processingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Quick Connect"}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                                <div className="h-px bg-slate-100 w-full my-8" />
                            </div>
                        )
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProfiles.length > 0 ? filteredProfiles.map((item, index) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 24 }}
                                whileHover={{ y: -8, scale: 1.01 }}
                                className="h-full"
                            >
                                <Card className="h-full group border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
                                    <div className="h-2 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <CardContent className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                                {user?.role === "STARTUP" ? <User className="h-7 w-7 text-indigo-600" /> : <Building2 className="h-7 w-7 text-indigo-600" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setAuditData({
                                                            name: item.companyName || item.firmName || item.userId?.name,
                                                            type: user?.role === "INVESTOR" ? "STARTUP" : "INVESTOR",
                                                            founder: item.userId?.name || ""
                                                        });
                                                        setIsAuditOpen(true);
                                                    }}
                                                    className="p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-colors"
                                                    title="Run Deep History Audit"
                                                >
                                                    <History className="h-4 w-4" />
                                                </button>
                                                {item.userId?.verificationStatus === "VERIFIED" && (
                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] uppercase tracking-wider">
                                                        <ShieldCheck className="h-3 w-3 mr-1" />
                                                        Verified
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                {item.companyName || item.firmName || item.userId?.name}
                                            </h3>

                                            {/* Trust Radar Component */}
                                            <div className="my-4 -mx-2 bg-slate-50/50 dark:bg-slate-900/10 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                <TrustRadar scores={{
                                                    identity: item.userId?.verificationStatus === "VERIFIED" ? 100 : 40,
                                                    financials: item.revenueVerified ? 90 : 30,
                                                    team: 85,
                                                    legal: 75,
                                                    traction: item.isMvpReady ? 90 : 50
                                                }} />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <Badge variant="outline" className="p-0 border-none text-slate-500 text-xs font-semibold uppercase tracking-tight">
                                                    {item.industry || item.investorType || "General"}
                                                </Badge>
                                                <span className="text-slate-300">•</span>
                                                <span className="text-xs text-slate-500">
                                                    {item.fundingStage || (item.minInvestment ? `$${(item.minInvestment / 1000).toFixed(0)}k+` : "Seed")}
                                                </span>
                                                {item.website && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 transition-colors">
                                                            <Globe className="h-3 w-3" />
                                                        </a>
                                                    </>
                                                )}
                                            </div>

                                            {/* Verification Credentials */}
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {item.userId?.gstNumber && (
                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-200 py-0 h-5">
                                                        GST: {item.userId.gstNumber.slice(0, 4)}...
                                                    </Badge>
                                                )}
                                                {item.userId?.udyamNumber && (
                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-200 py-0 h-5">
                                                        UDYAM
                                                    </Badge>
                                                )}
                                                {item.userId?.dpiitNumber && (
                                                    <Badge variant="outline" className="text-[9px] bg-slate-50 text-slate-600 border-slate-200 py-0 h-5">
                                                        DPIIT
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                                                {item.description || item.bio || "No description provided yet."}
                                            </p>
                                        </div>

                                        {item.tags && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {item.tags.slice(0, 3).map((tag: string) => (
                                                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 border-none text-[10px] font-bold">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
                                        {user?.role === "INVESTOR" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-white hover:bg-slate-50 border-indigo-100 text-indigo-600 gap-2 font-bold"
                                                onClick={() => {
                                                    setSelectedAnalysisProfile(item);
                                                    setIsAnalysisOpen(true);
                                                }}
                                            >
                                                <BrainCircuit className="h-4 w-4" />
                                                Analyze Match
                                            </Button>
                                        )}

                                        {item.connectionStatus === "ACCEPTED" ? (
                                            <Button size="sm" variant="outline" className="flex-1 bg-emerald-50 text-emerald-700 border-emerald-100 gap-2 font-bold">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Connected
                                            </Button>
                                        ) : item.connectionStatus === "PENDING" ? (
                                            <Button size="sm" disabled className="flex-1 bg-slate-100 text-slate-400 gap-2 border-none">
                                                <Clock className="h-4 w-4" />
                                                Pending
                                            </Button>
                                        ) : item.connectionStatus === "RECEIVED_PENDING" ? (
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2"
                                                onClick={() => handleAccept(item.connectionId, item.userId._id)}
                                                disabled={processingId === item.userId._id}
                                            >
                                                {processingId === item.userId._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept"}
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2"
                                                onClick={() => handleConnect(item.userId._id)}
                                                disabled={processingId === item.userId._id}
                                            >
                                                {processingId === item.userId._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                                                <ArrowUpRight className="h-3 w-3" />
                                            </Button>
                                        )}
                                        {user?.role === "STARTUP" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="px-3 bg-white hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                                                onClick={() => handleAddToPipeline(item.userId._id)}
                                                title="Add to Pipeline"
                                            >
                                                <Target className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-10 w-10 text-slate-200" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900">No results found</h3>
                                <p className="text-slate-500">Try adjusting your search or filters to find more profiles.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Pitch Deck Viewer Modal */}
            {selectedPitch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                    <FileText className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-slate-900">Pitch Deck Viewer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setSelectedPitch(null)} className="text-slate-600 hover:text-red-600 h-9 w-9 rounded-xl hover:bg-red-50">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-100">
                            <iframe
                                src={`${selectedPitch}#toolbar=0&navpanes=0&scrollbar=0`}
                                className="w-full h-full border-none"
                                title="Pitch Deck Viewer"
                            />
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 text-center">
                            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <LucideLock className="h-3 w-3" />
                                View Only Mode • Secure Stream • No Download Permitted
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <MatchAnalysisSidebar
                isOpen={isAnalysisOpen}
                onClose={() => setIsAnalysisOpen(false)}
                profile={selectedAnalysisProfile}
            />
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
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        }>
            <DiscoverContent />
        </Suspense>
    );
}
