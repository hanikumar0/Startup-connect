"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    Bookmark,
    Search,
    Trash2,
    Rocket,
    ChevronRight,
    Pin,
    PinOff,
    Star,
    Download,
    SortDesc,
    Users,
    Calendar,
    X,
    RefreshCw,
    Grid3x3,
    List,
    ArrowUpRight,
    Sparkles,
    Eye,
    Clock,
    Briefcase,
    MapPin,
    Loader2,
    WifiOff,
    BookmarkX,
    CheckCircle2,
} from "lucide-react";
import { apiFetchJSON, clearApiCache } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SavedItem {
    _id: string;
    targetId: string;
    targetType: "startup" | "investor" | "meeting";
    isFavorite: boolean;
    isPinned: boolean;
    notes?: string;
    tags?: string[];
    createdAt: string;
    details?: {
        name?: string;
        startupName?: string;
        investorName?: string;
        firm?: string;
        industry?: string;
        location?: string;
        logo?: string;
        bio?: string;
        description?: string;
        website?: string;
        stage?: string;
        title?: string;
    };
}

interface Stats {
    total: number;
    startups: number;
    investors: number;
    meetings: number;
    pinned: number;
    favorites: number;
}

type TabType = "all" | "startup" | "investor" | "meeting";
type SortType = "recent" | "oldest" | "pinned";
type ViewType = "grid" | "list";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getDisplayName(item: SavedItem): string {
    return (
        item.details?.startupName ||
        item.details?.investorName ||
        item.details?.name ||
        item.details?.title ||
        "Unknown"
    );
}

function getTypeConfig(type: string) {
    switch (type) {
        case "startup":
            return {
                label: "Startup",
                color: "text-indigo-600",
                bg: "bg-indigo-50",
                border: "border-indigo-100",
                icon: Rocket,
                badgeBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
            };
        case "investor":
            return {
                label: "Investor",
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
                icon: Briefcase,
                badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
            };
        case "meeting":
            return {
                label: "Meeting",
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-100",
                icon: Calendar,
                badgeBg: "bg-purple-50 text-purple-600 border-purple-100",
            };
        default:
            return {
                label: "Item",
                color: "text-slate-600",
                bg: "bg-slate-50",
                border: "border-slate-100",
                icon: Bookmark,
                badgeBg: "bg-slate-50 text-slate-600 border-slate-100",
            };
    }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatPill({
    icon: Icon,
    label,
    value,
    color,
}: {
    icon: any;
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
            <Icon size={14} className={color} />
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{label}</span>
            <span className={`text-sm font-black ${color}`}>{value}</span>
        </div>
    );
}

function SavedCard({
    item,
    viewMode,
    onRemove,
    onTogglePin,
    onToggleFavorite,
}: {
    item: SavedItem;
    viewMode: ViewType;
    onRemove: (id: string) => void;
    onTogglePin: (id: string) => void;
    onToggleFavorite: (id: string) => void;
}) {
    const cfg = getTypeConfig(item.targetType);
    const TypeIcon = cfg.icon;
    const displayName = getDisplayName(item);
    const initials = displayName.charAt(0).toUpperCase();
    const savedDate = new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

    if (viewMode === "list") {
        return (
            <div className="group flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200">
                {/* Avatar */}
                <div className={`h-10 w-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center font-black text-sm shrink-0`}>
                    {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {item.isPinned && <Pin size={11} className="text-amber-500 shrink-0" />}
                        <p className="font-black text-slate-900 text-sm truncate">{displayName}</p>
                        <Badge className={`text-[9px] font-black uppercase tracking-widest border ${cfg.badgeBg} px-2 py-0.5`}>
                            {cfg.label}
                        </Badge>
                        {item.isFavorite && (
                            <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                        {item.details?.industry || item.details?.firm || "—"} {item.details?.location ? `· ${item.details.location}` : ""}
                    </p>
                </div>

                {/* Date */}
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest shrink-0 hidden md:block">
                    {savedDate}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={() => onToggleFavorite(item._id)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${item.isFavorite ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"}`}
                        title={item.isFavorite ? "Unmark favorite" : "Mark favorite"}
                    >
                        <Star size={13} fill={item.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={() => onTogglePin(item._id)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${item.isPinned ? "text-amber-600 bg-amber-50" : "text-slate-300 hover:text-amber-600 hover:bg-amber-50"}`}
                        title={item.isPinned ? "Unpin" : "Pin to top"}
                    >
                        {item.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                    <Link href={`/${item.targetType}/${item.targetId}`}>
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <ArrowUpRight size={13} />
                        </button>
                    </Link>
                    <button
                        onClick={() => onRemove(item._id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remove"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        );
    }

    // Grid card
    return (
        <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden">
            {/* Pin banner */}
            {item.isPinned && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400" />
            )}

            {/* Favorite ribbon */}
            {item.isFavorite && (
                <div className="absolute top-3 right-3 z-10">
                    <div className="h-6 w-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                        <Star size={10} className="text-white fill-white" />
                    </div>
                </div>
            )}

            <div className="p-5 pb-0 flex items-start justify-between">
                {/* Avatar */}
                <div className={`h-12 w-12 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center font-black text-lg shadow-sm`}>
                    {initials}
                </div>

                {/* Hover actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onToggleFavorite(item._id)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${item.isFavorite ? "text-amber-500 bg-amber-50" : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"}`}
                    >
                        <Star size={13} fill={item.isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={() => onTogglePin(item._id)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${item.isPinned ? "text-amber-600 bg-amber-50" : "text-slate-300 hover:text-amber-600 hover:bg-amber-50"}`}
                    >
                        {item.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                    </button>
                    <button
                        onClick={() => onRemove(item._id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-3">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-slate-900 text-sm leading-tight truncate">{displayName}</h3>
                        <TypeIcon size={11} className={cfg.color} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {item.details?.industry || item.details?.firm || "—"}
                    </p>
                </div>

                {item.details?.bio && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.details.bio}
                    </p>
                )}

                <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Badge className={`text-[9px] font-black uppercase tracking-widest border ${cfg.badgeBg} px-2 py-0.5`}>
                            {cfg.label}
                        </Badge>
                        {item.details?.location && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <MapPin size={9} />
                                {item.details.location}
                            </span>
                        )}
                    </div>

                    <Link href={`/${item.targetType}/${item.targetId}`}>
                        <button className="h-7 px-3 rounded-lg text-[10px] font-black text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center gap-1">
                            View <ChevronRight size={11} />
                        </button>
                    </Link>
                </div>

                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={9} /> Saved {savedDate}
                </p>
            </div>
        </div>
    );
}

function EmptyState({ activeTab, stats }: { activeTab: TabType; stats: Stats | null }) {
    const router = useRouter();
    const label =
        activeTab === "startup" ? "startups" :
            activeTab === "investor" ? "investors" :
                activeTab === "meeting" ? "meetings" : "items";

    return (
        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
                <div className="h-24 w-24 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <BookmarkX size={32} className="text-slate-300" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles size={14} className="text-white" />
                </div>
            </div>

            <div className="space-y-2 max-w-sm">
                <h3 className="text-xl font-black text-slate-900">No saved {label} yet</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Start exploring and bookmark {label} you want to revisit. Your collection will appear here.
                </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap justify-center">
                <Button
                    onClick={() => router.push("/dashboard/discover")}
                    className="h-10 px-6 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                    <Rocket size={14} className="mr-2" /> Explore Startups
                </Button>
                <Button
                    onClick={() => router.push("/dashboard/discover?type=investor")}
                    variant="outline"
                    className="h-10 px-6 font-black text-[11px] uppercase tracking-widest rounded-xl border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                    <Users size={14} className="mr-2" /> Find Investors
                </Button>
            </div>
        </div>
    );
}

function RecentlyViewedSection({ items }: { items: any[] }) {
    if (!items.length) return null;
    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <Eye size={14} className="text-slate-400" />
                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                    Recently Viewed
                </h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {items.map((item, i) => {
                    const cfg = getTypeConfig(item.targetType);
                    const name = item.details?.startupName || item.details?.investorName || item.details?.name || "Unknown";
                    return (
                        <Link
                            key={item._id || i}
                            href={`/${item.targetType}/${item.targetId}`}
                            className="flex-none flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all min-w-[200px] group"
                        >
                            <div className={`h-9 w-9 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center font-black text-sm shrink-0`}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{name}</p>
                                <p className="text-[10px] text-slate-400 font-medium capitalize">{item.targetType}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}

function AIRecommendationsSection({ isStartup }: { isStartup: boolean }) {
    const mockRecs = isStartup
        ? [
            { name: "EduTech AI", industry: "Education Technology", score: 94, type: "investor" },
            { name: "Sequoia India", industry: "Venture Capital", score: 88, type: "investor" },
            { name: "Blume Ventures", industry: "Early Stage VC", score: 82, type: "investor" },
        ]
        : [
            { name: "HealthTech Pro", industry: "Healthcare", score: 96, type: "startup" },
            { name: "AgriSmart", industry: "AgriTech", score: 91, type: "startup" },
            { name: "FinFlow AI", industry: "FinTech", score: 87, type: "startup" },
        ];

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                    </div>
                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">
                        Recommended for You
                    </h2>
                </div>
                <Badge className="text-[9px] font-black bg-indigo-50 text-indigo-600 border-none px-3 uppercase tracking-widest">
                    AI Powered
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockRecs.map((rec, i) => {
                    const cfg = getTypeConfig(rec.type);
                    const TypeIcon = cfg.icon;
                    return (
                        <div
                            key={i}
                            className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            <div className={`h-10 w-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center font-black text-sm shrink-0`}>
                                {rec.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{rec.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium truncate">{rec.industry}</p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className={`text-sm font-black ${cfg.color}`}>{rec.score}%</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Match</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ onClose, items }: { onClose: () => void; items: SavedItem[] }) {
    const handleCSV = () => {
        const headers = ["Name", "Type", "Industry", "Location", "Pinned", "Favorite", "Saved At"];
        const rows = items.map((item) => [
            getDisplayName(item),
            item.targetType,
            item.details?.industry || "",
            item.details?.location || "",
            item.isPinned ? "Yes" : "No",
            item.isFavorite ? "Yes" : "No",
            new Date(item.createdAt).toLocaleDateString("en-IN"),
        ]);
        const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `saved-items-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exported successfully!");
        onClose();
    };

    const handleJSON = () => {
        const data = items.map((item) => ({
            name: getDisplayName(item),
            type: item.targetType,
            industry: item.details?.industry || "",
            location: item.details?.location || "",
            isPinned: item.isPinned,
            isFavorite: item.isFavorite,
            savedAt: item.createdAt,
        }));
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `saved-items-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("JSON exported successfully!");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm space-y-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">Export Collection</h3>
                    <button onClick={onClose} className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X size={14} />
                    </button>
                </div>
                <p className="text-sm text-slate-500">Export your {items.length} saved items to a file.</p>
                <div className="space-y-3">
                    <button
                        onClick={handleCSV}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">CSV</div>
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Export as CSV</p>
                            <p className="text-xs text-slate-400">Compatible with Excel, Sheets</p>
                        </div>
                    </button>
                    <button
                        onClick={handleJSON}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                    >
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">JSON</div>
                        <div className="text-left">
                            <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">Export as JSON</p>
                            <p className="text-xs text-slate-400">For developers and integrations</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SavedPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [items, setItems] = useState<SavedItem[]>([]);
    const [recentItems, setRecentItems] = useState<any[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sort, setSort] = useState<SortType>("recent");
    const [viewMode, setViewMode] = useState<ViewType>("grid");
    const [showExport, setShowExport] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const isStartup = user?.role?.toLowerCase() === "startup";
    const searchRef = useRef<HTMLInputElement>(null);
    const sortMenuRef = useRef<HTMLDivElement>(null);

    // Auth guard
    useEffect(() => {
        if (!user) router.push("/login");
    }, [user]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch data
    useEffect(() => {
        fetchAll();
    }, [activeTab, sort]);

    // Close sort menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
                setShowSortMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const typeParam = activeTab !== "all" ? `&type=${activeTab}` : "";
            const [savedRes, recentRes, statsRes] = await Promise.all([
                apiFetchJSON(`/api/save?sort=${sort}${typeParam}`),
                apiFetchJSON("/api/save/recent"),
                apiFetchJSON("/api/save/stats"),
            ]);

            if (savedRes.success) setItems(savedRes.data || []);
            else setError("Failed to load saved items.");

            if (recentRes.success) setRecentItems(recentRes.data || []);
            if (statsRes.success) setStats(statsRes.stats);
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = useCallback(async (saveId: string) => {
        setRemovingId(saveId);
        // Optimistic remove
        setItems((prev) => prev.filter((i) => i._id !== saveId));
        const res = await apiFetchJSON(`/api/save/${saveId}`, { method: "DELETE" });
        if (res.success) {
            toast.success("Removed from saved collection.");
            clearApiCache();
            if (stats) setStats((s) => s ? { ...s, total: Math.max(0, s.total - 1) } : s);
        } else {
            toast.error("Failed to remove. Please try again.");
            fetchAll(); // Re-fetch to restore
        }
        setRemovingId(null);
    }, [stats]);

    const handleTogglePin = useCallback(async (saveId: string) => {
        setItems((prev) =>
            prev.map((i) => (i._id === saveId ? { ...i, isPinned: !i.isPinned } : i))
        );
        const res = await apiFetchJSON(`/api/save/${saveId}/pin`, { method: "PUT" });
        if (res.success) {
            toast.success(res.isPinned ? "📌 Pinned to top!" : "Unpinned.");
            clearApiCache();
        } else {
            fetchAll();
        }
    }, []);

    const handleToggleFavorite = useCallback(async (saveId: string) => {
        setItems((prev) =>
            prev.map((i) => (i._id === saveId ? { ...i, isFavorite: !i.isFavorite } : i))
        );
        const res = await apiFetchJSON(`/api/save/${saveId}/favorite`, { method: "PUT" });
        if (res.success) {
            toast.success(res.isFavorite ? "⭐ Marked as favorite!" : "Removed from favorites.");
            clearApiCache();
        } else {
            fetchAll();
        }
    }, []);

    // Client-side search filter
    const filteredItems = items.filter((item) => {
        if (!debouncedSearch.trim()) return true;
        const q = debouncedSearch.toLowerCase();
        const name = getDisplayName(item).toLowerCase();
        const bio = (item.details?.bio || item.details?.description || "").toLowerCase();
        const industry = (item.details?.industry || "").toLowerCase();
        const tags = (item.tags || []).join(" ").toLowerCase();
        return name.includes(q) || bio.includes(q) || industry.includes(q) || tags.includes(q);
    });

    // Split pinned vs rest
    const pinnedItems = filteredItems.filter((i) => i.isPinned);
    const unpinnedItems = filteredItems.filter((i) => !i.isPinned);

    const tabs: { id: TabType; label: string; icon: any; count: number }[] = [
        { id: "all", label: "All", icon: Bookmark, count: stats?.total || 0 },
        { id: "startup", label: "Startups", icon: Rocket, count: stats?.startups || 0 },
        { id: "investor", label: "Investors", icon: Briefcase, count: stats?.investors || 0 },
        { id: "meeting", label: "Meetings", icon: Calendar, count: stats?.meetings || 0 },
    ];

    const sortOptions: { id: SortType; label: string }[] = [
        { id: "recent", label: "Recently Saved" },
        { id: "oldest", label: "Oldest First" },
        { id: "pinned", label: "Pinned First" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="max-w-[1280px] mx-auto px-6 py-10 space-y-10">

                {/* ── Header ──────────────────────────────────────────────── */}
                <header className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <Bookmark size={12} className="text-indigo-600" />
                                <span>Dashboard</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span className="text-slate-600">Saved Items</span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                Your Collection
                            </h1>
                            <p className="text-sm text-slate-500 font-medium">
                                Bookmarked startups, investors, and meetings all in one place.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Refresh */}
                            <button
                                onClick={fetchAll}
                                disabled={loading}
                                className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
                            >
                                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                            </button>

                            {/* Export */}
                            <button
                                onClick={() => setShowExport(true)}
                                className="h-10 px-4 rounded-xl bg-white border border-slate-200 flex items-center gap-2 text-sm font-black text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
                            >
                                <Download size={14} /> Export
                            </button>

                            {/* View toggle */}
                            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`h-10 w-10 flex items-center justify-center transition-colors ${viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-700"}`}
                                >
                                    <Grid3x3 size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`h-10 w-10 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-700"}`}
                                >
                                    <List size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats pills */}
                    {stats && (
                        <div className="flex flex-wrap gap-2">
                            <StatPill icon={Bookmark} label="Total" value={stats.total} color="text-indigo-600" />
                            <StatPill icon={Pin} label="Pinned" value={stats.pinned} color="text-amber-600" />
                            <StatPill icon={Star} label="Favorites" value={stats.favorites} color="text-amber-400" />
                            <StatPill icon={Rocket} label="Startups" value={stats.startups} color="text-indigo-500" />
                            <StatPill icon={Briefcase} label="Investors" value={stats.investors} color="text-emerald-600" />
                        </div>
                    )}
                </header>

                {/* ── Search + Filter bar ─────────────────────────────────── */}
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search by name, industry, tags…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-11 pl-11 pr-10 rounded-2xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white border border-slate-200 rounded-2xl p-1 gap-1 shadow-sm overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                        active
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon size={11} />
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Sort */}
                    <div className="relative" ref={sortMenuRef}>
                        <button
                            onClick={() => setShowSortMenu(!showSortMenu)}
                            className="h-11 px-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-2 text-sm font-black text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm whitespace-nowrap"
                        >
                            <SortDesc size={14} />
                            {sortOptions.find((s) => s.id === sort)?.label}
                        </button>
                        {showSortMenu && (
                            <div className="absolute right-0 top-13 mt-2 w-48 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden">
                                {sortOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => { setSort(opt.id); setShowSortMenu(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-left hover:bg-slate-50 transition-colors ${sort === opt.id ? "text-indigo-600 bg-indigo-50/50" : "text-slate-700"}`}
                                    >
                                        {sort === opt.id && <CheckCircle2 size={13} className="text-indigo-600" />}
                                        {sort !== opt.id && <div className="w-[13px]" />}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Error State ─────────────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl">
                        <WifiOff size={20} className="text-red-400 shrink-0" />
                        <div className="flex-1">
                            <p className="font-black text-red-700 text-sm">{error}</p>
                            <p className="text-xs text-red-400 mt-0.5">Check your connection and try again.</p>
                        </div>
                        <button onClick={fetchAll} className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm font-black hover:bg-red-700 transition-colors">
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Loading ─────────────────────────────────────────────── */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center space-y-4">
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto">
                                <Loader2 size={24} className="text-indigo-600 animate-spin" />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Loading your collection…
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Content ─────────────────────────────────────────────── */}
                {!loading && !error && (
                    <div className="space-y-8">

                        {/* Search results count */}
                        {debouncedSearch && (
                            <p className="text-xs font-bold text-slate-400">
                                {filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""} for &ldquo;<span className="text-indigo-600">{debouncedSearch}</span>&rdquo;
                            </p>
                        )}

                        {/* Pinned section */}
                        {pinnedItems.length > 0 && (
                            <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Pin size={13} className="text-amber-500" />
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        Pinned ({pinnedItems.length})
                                    </h2>
                                </div>
                                <div className={viewMode === "grid"
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                                    : "space-y-2"}>
                                    {pinnedItems.map((item) => (
                                        <SavedCard
                                            key={item._id}
                                            item={item}
                                            viewMode={viewMode}
                                            onRemove={handleRemove}
                                            onTogglePin={handleTogglePin}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Main saved items */}
                        <section className="space-y-4">
                            {pinnedItems.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Bookmark size={13} className="text-slate-400" />
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        All Items ({unpinnedItems.length})
                                    </h2>
                                </div>
                            )}

                            {filteredItems.length === 0 ? (
                                <div className={viewMode === "grid" ? "grid grid-cols-1" : ""}>
                                    <EmptyState activeTab={activeTab} stats={stats} />
                                </div>
                            ) : (
                                <div className={viewMode === "grid"
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                                    : "space-y-2"}>
                                    {(pinnedItems.length > 0 ? unpinnedItems : filteredItems).map((item) => (
                                        <SavedCard
                                            key={item._id}
                                            item={item}
                                            viewMode={viewMode}
                                            onRemove={handleRemove}
                                            onTogglePin={handleTogglePin}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Recently Viewed */}
                        {recentItems.length > 0 && (
                            <RecentlyViewedSection items={recentItems} />
                        )}

                        {/* AI Recommendations */}
                        <AIRecommendationsSection isStartup={isStartup} />
                    </div>
                )}
            </div>

            {/* Export Modal */}
            {showExport && (
                <ExportModal onClose={() => setShowExport(false)} items={filteredItems} />
            )}
        </div>
    );
}
