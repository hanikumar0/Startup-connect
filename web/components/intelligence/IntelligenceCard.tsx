"use client";

import { useState } from "react";
import { 
    Calendar, 
    ExternalLink, 
    MapPin, 
    Bookmark, 
    Share2, 
    Zap,
    Trophy,
    GraduationCap,
    Globe,
    Building2,
    TrendingUp,
    ChevronRight,
    Search,
    Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

export function IntelligenceCard({ item, isSavedInitial = false }: { item: any, isSavedInitial?: boolean }) {
    const [isSaved, setIsSaved] = useState(isSavedInitial);
    const [isSaving, setIsSaving] = useState(false);

    const toggleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        try {
            if (isSaved) {
                await apiFetch(`/api/intelligence/save/${item._id}`, { method: "DELETE" });
                setIsSaved(false);
            } else {
                await apiFetch("/api/intelligence/save", {
                    method: "POST",
                    body: JSON.stringify({ itemId: item._id })
                });
                setIsSaved(true);
            }
        } catch (err) {
            console.error("Save toggle fail", err);
        } finally {
            setIsSaving(false);
        }
    };

    const getIcon = () => {
        switch (item.type) {
            case "news": return <Globe className="text-blue-500" size={18} />;
            case "event": return <Calendar className="text-purple-500" size={18} />;
            case "workshop": return <GraduationCap className="text-amber-500" size={18} />;
            case "grant": return <Trophy className="text-emerald-500" size={18} />;
            case "accelerator": return <Zap className="text-indigo-500" size={18} />;
            case "trend": return <TrendingUp className="text-rose-500" size={18} />;
            default: return <Building2 className="text-slate-500" size={18} />;
        }
    };

    const getTypeColor = () => {
        switch (item.type) {
            case "news": return "bg-blue-50 text-blue-600 border-blue-100";
            case "event": return "bg-purple-50 text-purple-600 border-purple-100";
            case "workshop": return "bg-amber-50 text-amber-600 border-amber-100";
            case "grant": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "accelerator": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "trend": return "bg-rose-50 text-rose-600 border-rose-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <Card className="group relative bg-white border border-slate-100 rounded-[28px] overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
            {item.imageUrl && (
                <div className="h-40 w-full overflow-hidden">
                    <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                </div>
            )}
            
            <CardContent className="p-7 space-y-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${getTypeColor()}`}>
                            {getIcon()}
                        </div>
                        <Badge className={`uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-lg border shadow-sm ${getTypeColor()}`}>
                            {item.type}
                        </Badge>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-10 w-10 rounded-xl transition-all ${isSaved ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        onClick={toggleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />}
                    </Button>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.title}
                    </h3>
                    <p className="text-[13px] font-medium text-slate-500 line-clamp-2 leading-relaxed">
                        {item.summary}
                    </p>
                </div>

                {item.aiInsights && (
                    <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1.5 text-indigo-600">
                            <Zap size={12} className="fill-indigo-600" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Insight</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                             {item.aiInsights}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                    {item.eventDate && (
                        <div className="flex items-center gap-2 text-slate-500">
                            <Calendar size={13} className="text-indigo-500" />
                            <span className="text-[11px] font-semibold tracking-tight">
                                {new Date(item.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    )}
                    {item.location && (
                        <div className="flex items-center gap-2 text-slate-500">
                            <MapPin size={13} className="text-rose-500" />
                            <span className="text-[11px] font-semibold tracking-tight truncate">
                                {item.location}
                            </span>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                            via {item.source || "Ecosystem"} {item.platform && item.platform !== 'platform' ? `(${item.platform})` : ''}
                        </span>
                        {item.organizer && (
                            <span className="text-[10px] font-medium text-slate-400">Org: {item.organizer}</span>
                        )}
                    </div>
                    <Button 
                        variant="link" 
                        className="p-0 h-auto text-[11px] font-bold text-indigo-600 uppercase tracking-widest hover:no-underline group/link"
                        asChild
                    >
                        <a href={item.sourceUrl || item.registerUrl || "#"} target="_blank" rel="noopener noreferrer">
                            Explore <ChevronRight size={14} className="ml-1 group-hover/link:translate-x-1 transition-transform" />
                        </a>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export function IntelligenceSkeleton() {
    return (
        <Card className="bg-white border-slate-50 rounded-[28px] overflow-hidden">
            <div className="p-7 space-y-5">
                <div className="flex justify-between">
                    <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
                    <div className="h-10 w-10 bg-slate-100 rounded-xl animate-pulse" />
                </div>
                <div className="space-y-2">
                    <div className="h-6 w-full bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg animate-pulse" />
                </div>
                <div className="h-16 w-full bg-slate-50 rounded-2xl animate-pulse" />
                <div className="pt-4 flex justify-between">
                    <div className="h-4 w-20 bg-slate-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-20 bg-slate-100 rounded-lg animate-pulse" />
                </div>
            </div>
        </Card>
    );
}
