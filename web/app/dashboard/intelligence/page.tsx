"use client";

import { useEffect, useState } from "react";
import { 
    Search, 
    Globe, 
    Calendar, 
    GraduationCap, 
    Trophy, 
    TrendingUp, 
    Filter,
    ArrowRight,
    SearchX,
    Sparkles,
    Bookmark,
    RefreshCw,
    Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntelligenceCard, IntelligenceSkeleton } from "@/components/intelligence/IntelligenceCard";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";

export default function MarketIntelligencePage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [items, setItems] = useState<any[]>([]);
    const [savedItems, setSavedItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showingSaved, setShowingSaved] = useState(false);
    const [counts, setCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        // Initial setup if needed
    }, []);

    useEffect(() => {
        fetchData();
        fetchSavedStatus();
        fetchCounts();
    }, [debouncedQuery, activeTab, showingSaved]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let endpoint = `/api/intelligence?type=${activeTab}&q=${debouncedQuery}`;
            if (showingSaved) {
                endpoint = "/api/intelligence/saved";
            }
            const res = await apiFetch(endpoint);
            const json = await res.json();
            if (json.success) setItems(json.data);
        } catch (err) {
            console.error("Fetch intel fail", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const res = await apiFetch("/api/intelligence/counts");
            const json = await res.json();
            if (json.success) setCounts(json.data);
        } catch (err) { }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await apiFetch("/api/intelligence/sync", { method: "POST" });
            const json = await res.json();
            if (json.success) {
                // Poll for updates or just refresh after a delay
                setTimeout(() => {
                    fetchData();
                    fetchCounts();
                    setIsSyncing(false);
                }, 3000);
            }
        } catch (err) {
            setIsSyncing(false);
        }
    };

    const fetchSavedStatus = async () => {
        try {
            const res = await apiFetch("/api/intelligence/saved");
            const json = await res.json();
            if (json.success) setSavedItems(json.data.map((i: any) => i._id));
        } catch (err) { }
    };

    const tabs = [
        { id: "all", label: "Everything", icon: Sparkles },
        { id: "news", label: "Market News", icon: Globe },
        { id: "event", label: "Pitch & Network", icon: Calendar },
        { id: "workshop", label: "Masterclasses", icon: GraduationCap },
        { id: "grant", label: "Grants & Perks", icon: Trophy },
        { id: "trend", label: "VC Intelligence", icon: TrendingUp },
    ];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>ECOSYSTEM</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-indigo-600">INTELLIGENCE HUB</span>
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                        Market Pulse
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        variant={showingSaved ? "default" : "outline"}
                        className={`h-11 px-6 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all ${showingSaved ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'border-slate-200'}`}
                        onClick={() => setShowingSaved(!showingSaved)}
                    >
                        <Bookmark className="mr-2 h-4 w-4" fill={showingSaved ? "currentColor" : "none"} />
                        {showingSaved ? "Viewing Saved" : "Saved Resources"}
                    </Button>
                </div>
            </header>


            {/* Search & Filters */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-600 transition-colors">
                    <Search size={20} />
                </div>
                <Input 
                    placeholder="Search intelligence (e.g. AI funding, Seed grants India, Pitch nights...)"
                    className="h-16 pl-14 pr-6 rounded-[24px] border border-slate-100 bg-white shadow-xl shadow-slate-100/40 text-lg font-medium placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Main Content */}
            {!showingSaved && (
                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="bg-white p-2 h-auto rounded-[24px] border border-slate-50 shadow-sm flex flex-wrap gap-2 lg:justify-between overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => (
                            <TabsTrigger 
                                key={tab.id}
                                value={tab.id}
                                className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-100 rounded-[20px] px-6 py-3 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                                <tab.icon size={14} />
                                {tab.label}
                                {counts[tab.id] > 0 && (
                                    <span className="ml-1 opacity-60 text-[10px]">({counts[tab.id]})</span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => <IntelligenceSkeleton key={i} />)
                ) : items.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                        {items.map((item, i) => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <IntelligenceCard item={item} isSavedInitial={savedItems.includes(item._id)} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="col-span-full py-32 flex flex-col items-center text-center space-y-6 bg-white/50 border-2 border-dashed border-slate-200 rounded-[32px]">
                         <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                             <SearchX size={40} />
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">No findings detected</h3>
                            <p className="max-w-md text-[13px] font-medium text-slate-400">We couldn't find any active records for this category. Try syncing live data or adjusting your search for better coverage.</p>
                         </div>
                         <Button 
                            onClick={handleSync} 
                            disabled={isSyncing}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-wider h-11 px-8 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                         >
                             {isSyncing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Synchronizing...
                                </>
                             ) : (
                                <>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Sync Live Intelligence
                                </>
                             )}
                         </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
