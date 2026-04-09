"use client";

import { useState, useEffect } from "react";
import { 
  Bookmark, 
  Star, 
  History, 
  List, 
  Trash2, 
  Rocket,
  Wallet,
  ChevronRight,
  Filter,
  MoreVertical,
  Search,
  MapPin,
  ShieldCheck
} from "lucide-react";
import { apiFetchJSON } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function SavedPage() {
    const [activeTab, setActiveTab] = useState<"saved" | "favorites" | "recent" | "watchlist">("saved");
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchItems();
    }, [activeTab]);

    const fetchItems = async () => {
        setLoading(true);
        try {
          let endpoint = "/api/save";
          if (activeTab === 'favorites') endpoint = "/api/save?isFavorite=true";
          if (activeTab === 'recent') endpoint = "/api/save/recent";
          if (activeTab === 'watchlist') endpoint = "/api/save/watchlist";

          const res = await apiFetchJSON(endpoint);
          if (res.success) setItems(res.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        const res = await apiFetchJSON("/api/save", {
            method: "POST",
            body: JSON.stringify({ targetId: id })
        });
        if (res.success) {
            toast.success("Identity removed from collection.");
            fetchItems();
        }
    };

    const handleToggleFavorite = async (saveId: string) => {
        const res = await apiFetchJSON(`/api/save/${saveId}/favorite`, { method: "PUT" });
        if (res.success) {
            toast.success(res.isFavorite ? "Marked as high priority" : "Removed priority");
            fetchItems();
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-[1240px] mx-auto px-6 py-10 space-y-10">
                
                {/* Clean Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                           <Bookmark size={14} className="text-primary" />
                           <span>Curated Archives</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Strategic Collections</h1>
                    </div>
                    
                    <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200">
                        {[
                            { id: 'saved', label: 'BOOKMARKS', icon: Bookmark },
                            { id: 'favorites', label: 'FAVORITES', icon: Star },
                            { id: 'recent', label: 'RECENT', icon: History },
                            { id: 'watchlist', label: 'LISTS', icon: List }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 h-9 rounded-md text-[10px] font-bold tracking-widest transition-all flex items-center gap-2 ${
                                    activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                <tab.icon size={12} /> {tab.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item, i) => (
                        <Card key={item._id || i} className="border-border shadow-none rounded-xl bg-white group hover:border-primary/20 transition-all flex flex-col h-full relative">
                            {item.isFavorite && (
                                <div className="absolute top-0 right-6 bg-amber-400 text-white px-3 py-1 rounded-b-md text-[9px] font-bold tracking-widest z-10">
                                    PRIORITY
                                </div>
                            )}
                            <CardHeader className="p-6 pb-0 flex flex-row justify-between items-start space-y-0">
                                 <div className={`h-12 w-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${
                                     item.targetType === 'startup' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                                 }`}>
                                     {item.details?.name?.charAt(0) || item.details?.startupName?.charAt(0) || 'S'}
                                 </div>
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className={`h-8 w-8 rounded-md ${item.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-slate-400'}`}
                                        onClick={() => handleToggleFavorite(item._id)}
                                    >
                                        <Star size={14} fill={item.isFavorite ? "currentColor" : "none"} />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        className="h-8 w-8 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                        onClick={() => handleRemove(item.targetId)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                 </div>
                            </CardHeader>
                            
                            <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 truncate">{item.details?.startupName || item.details?.investorName}</h3>
                                        {item.targetType === 'startup' ? <Rocket size={12} className="text-indigo-400" /> : <Wallet size={12} className="text-emerald-400" />}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{item.details?.industry || 'Investment Firm'}</p>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[10px] uppercase">
                                        <MapPin size={10} /> {item.details?.location || 'Remote Global'}
                                    </div>
                                    <Link href={`/${item.targetType}/${item.targetId}`}>
                                        <Button variant="outline" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase border-slate-200">
                                            View Profile <ChevronRight size={14} className="ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    
                    {items.length === 0 && !loading && (
                        <div className="col-span-full h-80 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-300">
                               <Bookmark size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Archives Clear</h4>
                                <p className="text-xs text-slate-500 mt-1 max-w-[240px] mx-auto">Seal strategic IDs to begin your curated institutional collection.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
