"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Globe, 
    Linkedin, 
    Mail, 
    ExternalLink, 
    MapPin, 
    ShieldAlert,
    BarChart3,
    Search,
    Bookmark,
    Loader2
} from "lucide-react";

import { apiFetchJSON } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ExternalDiscoverySectionProps {
    stats: {
        dailyOutreachCount: number;
        dailyLimit: number;
    };
    search?: string;
    filters?: {
        industry: string;
        location: string;
        stage: string;
    };
    onOutreachSent?: () => void;
}

export default function ExternalDiscoverySection({ stats, search = "", filters, onOutreachSent }: ExternalDiscoverySectionProps) {
    const { user } = useAuthStore();
    const userRole = (user?.role as string)?.toLowerCase() || "startup";
    const targetPlural = userRole === "startup" ? "Investors" : "Startups";
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newDataNotice, setNewDataNotice] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sendingInquiry, setSendingInquiry] = useState<string | null>(null);
    const isMounted = useRef(true);

    const fetchExternal = useCallback(async (p = 1, isBackground = false) => {
        if (!isBackground) setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams({
                q: search,
                industry: (filters?.industry && filters.industry !== "All Industries") ? filters.industry : "",
                location: filters?.location || "",
                page: p.toString(),
                limit: "8"
            }).toString();

            const data = await apiFetchJSON(`/api/external/discovery?${query}`);
            
            if (isMounted.current && data.success) {
                const fetchedProfiles = data.data;
                setProfiles(fetchedProfiles);
                setTotalPages(data.pages || 1);
                setCurrentPage(data.page || 1);

                // FIX 8: Debug Logs as requested
                console.log("User role:", userRole);
                console.log("External fetched:", fetchedProfiles); 

                // Source-based Debug Logs for Monitoring
                const productHuntData = fetchedProfiles.filter((p: any) => p.source === "Product Hunt");
                const githubData = fetchedProfiles.filter((p: any) => p.source === "GitHub");
                const csvData = fetchedProfiles.filter((p: any) => p.source === "CSV" || p.source === "OpenVC dataset");

                console.log("ProductHunt Entries:", productHuntData);
                console.log("GitHub Repos:", githubData);
                console.log("CSV Leads:", csvData);

                setProfiles(prevProfiles => {
                    if (isBackground && prevProfiles.length > 0) {
                        const prevIds = new Set(prevProfiles.map(p => p._id || p.id));
                        const hasNewItems = fetchedProfiles.some((p: any) => !prevIds.has(p._id || p.id));
                        
                        if (hasNewItems || fetchedProfiles.length !== prevProfiles.length) {
                            setNewDataNotice(true);
                            setTimeout(() => {
                                if (isMounted.current) setNewDataNotice(false);
                            }, 4000);
                        }
                    }
                    return fetchedProfiles;
                });
            }
        } catch (err) {
            console.error("Discovery Engine Failure:", err);
            if (isMounted.current && !isBackground) setError("Strategic Insight Engine Offline");
        } finally {
            if (isMounted.current && !isBackground) setLoading(false);
        }
    }, [userRole, search, filters]);

    const handleSendInquiry = async (profileId: string) => {
        setSendingInquiry(profileId);
        try {
            const data = await apiFetchJSON("/api/outreach/send-inquiry", {
                method: "POST",
                body: JSON.stringify({ 
                    externalProfileId: profileId,
                    message: `Hi, I'm interested in connecting with you regarding your profile on Startup Connect.`,
                    type: "EMAIL"
                })
            });

            if (data.success) {
                alert(data.message || "Inquiry sent successfully!");
                if (onOutreachSent) onOutreachSent();
            } else {
                alert(data.message || "Failed to send inquiry");
            }
        } catch (err) {
            console.error("Inquiry failed:", err);
            alert("An error occurred while dispatching the inquiry.");
        } finally {
            setSendingInquiry(null);
        }
    };

    useEffect(() => {
        isMounted.current = true;
        fetchExternal(1);
        return () => { isMounted.current = false; };
    }, [fetchExternal]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isMounted.current) fetchExternal(currentPage, true);
        }, 60000);
        
        return () => clearInterval(intervalId);
    }, [fetchExternal, currentPage]);

    const remaining = stats.dailyLimit - stats.dailyOutreachCount;
    const progress = (stats.dailyOutreachCount / stats.dailyLimit) * 100;

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {newDataNotice && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-8 left-1/2 z-50 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-2xl shadow-indigo-500/40 font-bold text-sm flex items-center gap-3 border border-indigo-400/20 backdrop-blur-md"
                    >
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </div>
                        Strategic Leads Updated
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header stays same... */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Globe className="text-indigo-600 h-4 w-4" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">External Discovery</h2>
                    </div>
                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg inline-block">Showing {targetPlural} for You</p>
                </div>
                
                {/* Outreach Limit Status */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 flex items-center gap-6">
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Discovery Quota</p>
                        <p className="text-sm font-bold text-slate-900">{remaining} / {stats.dailyLimit} <span className="text-slate-400 font-medium ml-1">Leads Remaining</span></p>
                    </div>
                    <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${100 - progress}%` }}
                            className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]" 
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[480px] bg-slate-50 border border-slate-100 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : profiles.length === 0 ? (
                            <div className="py-24 text-center space-y-6 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <Search className="text-slate-300 mx-auto" size={48} />
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900">No external intelligence found</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">Our discovery engine is current scanning global market sources. Adjust your filters to widen the search.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {profiles.map((item, idx) => (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                                        >
                                            <Card className="rounded-[2.5rem] border-slate-200 bg-white hover:shadow-2xl hover:shadow-slate-300/30 transition-all duration-300 overflow-hidden group border h-full flex flex-col hover:-translate-y-1">
                                                <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                                                    {/* Profile Header */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-4">
                                                            {item.metadata?.logo ? (
                                                                <div className="h-16 w-16 rounded-2xl border border-slate-100 p-1 bg-white overflow-hidden shadow-sm">
                                                                    <img src={item.metadata.logo} alt={item.name} className="h-full w-full object-contain" />
                                                                </div>
                                                            ) : (
                                                                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-indigo-500/20">
                                                                    {item.name ? item.name.charAt(0) : "?"}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.name || "Not specified"}</h3>
                                                                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">{item.firm || "Not specified"}</p>
                                                            </div>
                                                        </div>
                                                        <Badge className={`px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border-none ${
                                                            item.source === "Product Hunt" ? "bg-orange-100 text-orange-600" :
                                                            item.source === "GitHub" ? "bg-slate-100 text-slate-900" :
                                                            "bg-indigo-100 text-indigo-600"
                                                        }`}>
                                                            {item.source}
                                                        </Badge>
                                                    </div>

                                                    {/* Description / Tagline */}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-slate-900 leading-snug mb-2">
                                                            {item.description || item.metadata?.tagline || item.metadata?.description?.slice(0, 100) + "..." || "No metadata available."}
                                                        </p>
                                                        {item.metadata?.stars && (
                                                            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                                                                <span className="text-amber-500">★</span> {item.metadata.stars.toLocaleString()} Stars on GitHub
                                                            </div>
                                                        )}
                                                        {item.investor_type && (
                                                            <div className="flex items-center gap-1.5 text-indigo-500 text-[10px] font-bold uppercase mt-1">
                                                                Type: {item.investor_type}
                                                            </div>
                                                        )}
                                                        {(item.min_check || item.max_check) && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-100 italic">
                                                                    Check: {item.min_check} - {item.max_check}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Traits / Topics / Focus / Countries */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(item.countries?.length > 0 ? item.countries : (item.metadata?.topics || item.investmentFocus || [item.industry || "Technology"])).slice(0, 4).map((tag: any, i: number) => (
                                                            <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[10px] font-bold py-0.5 px-2">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>

                                                    {/* Quick View Metrics */}
                                                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry / Stage</p>
                                                            <p className="text-xs font-bold text-slate-800 truncate">{item.industry || "Venture Capital"} {item.stage ? `(${item.stage})` : ""}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Region</p>
                                                            <p className="text-xs font-bold text-slate-800 truncate">{item.location || "North America"}</p>
                                                        </div>
                                                    </div>



                                                    {/* Contact Info (if available) */}
                                                    <div className="space-y-3 pt-6 border-t border-slate-50">
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">Email</span>
                                                            <span className="text-xs font-medium truncate">{item.email || "Not public"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-slate-500">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-12">Social</span>
                                                            <span className="text-xs font-medium truncate">{item.linkedinUrl ? "LinkedIn Linked" : "No link"}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions - Bottom Fixed */}
                                                     <div className="flex flex-col gap-2 pt-6 mt-auto">
                                                         <Button 
                                                            onClick={() => handleSendInquiry(item._id || item.id)}
                                                            disabled={sendingInquiry === (item._id || item.id)}
                                                            className="w-full rounded-2xl h-12 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest gap-2 shadow-sm hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                                                         >
                                                             {sendingInquiry === (item._id || item.id) ? (
                                                                 <Loader2 className="animate-spin h-4 w-4" />
                                                             ) : (
                                                                 <Mail size={14} />
                                                             )}
                                                             {sendingInquiry === (item._id || item.id) ? "Sending..." : "Send Inquiry"}
                                                         </Button>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                onClick={() => window.open(item.website || "#", "_blank")} 
                                                                variant="outline" 
                                                                className="flex-1 rounded-2xl h-12 border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:border-indigo-600/30 hover:bg-indigo-50/50"
                                                            >
                                                                Website
                                                            </Button>
                                                            <Button 
                                                                onClick={() => window.open(item.linkedinUrl || "#", "_blank")}
                                                                variant="outline" 
                                                                className="h-12 w-12 p-0 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50"
                                                            >
                                                                <Linkedin size={18} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchExternal(currentPage - 1)}
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
                                    onClick={() => fetchExternal(pageNum)}
                                    className={cn(
                                        "w-10 h-10 rounded-xl font-bold transition-all",
                                        currentPage === pageNum ? "bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white border-none" : "bg-white text-slate-500"
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
                        onClick={() => fetchExternal(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="rounded-xl font-bold bg-white text-slate-600 border-slate-200"
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Shield Legend */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50/30 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
            >
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <ShieldAlert className="text-amber-600" size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-amber-900">Anti-Spam Verification Active</h4>
                    <p className="text-xs font-medium text-amber-800/80 leading-relaxed">
                        To maintain high response rates, we limit outreach to 20 Leads/day.
                        Each message is scanned for quality. Bulk messaging or generic copy results in account restrictions.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

