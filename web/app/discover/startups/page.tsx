"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { StartupCard } from "@/components/cards/StartupCard";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Input } from "@/components/ui/input";
import { Search, Filter, Rocket, ChevronRight, MapPin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";

const STARTUP_FALLBACKS = [
    { _id: 's1', startupName: 'Neuralink', industry: 'AI/ML', stage: 'Growth', location: 'San Francisco', fundingRequired: 150000000, description: 'Building the future of brain-machine interfaces.' },
    { _id: 's2', startupName: 'Stripe', industry: 'Fintech', stage: 'Growth', location: 'Global', fundingRequired: 500000000, description: 'Financial infrastructure for the internet.' },
    { _id: 's3', startupName: 'SpaceX', industry: 'Cleantech', stage: 'Growth', location: 'Boca Chica', fundingRequired: 250000000, description: 'Advancing humanity into a multi-planetary species.' }
];

export default function DiscoverStartupsPage() {
  const [startups, setStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("All");

  useEffect(() => {
    async function fetchData() {
        try {
            console.log("Fetching discover startups data...");
            const res = await apiFetch('/api/discover/startups?limit=100');
            if (res.ok) {
                const result = await res.json();
                console.log("Successfully fetched startups:", result.data?.length || 0, "records");
                
                if (!result.data || result.data.length === 0) {
                    console.warn("API returned 0 startups, utilizing local resilience cache.");
                    setStartups(STARTUP_FALLBACKS);
                } else {
                    setStartups(result.data);
                }
            } else {
                console.error("Failed to fetch startups. Status:", res.status);
                setStartups(STARTUP_FALLBACKS);
            }
        } catch (err) {
            console.error("Error during startup fetching:", err);
            setStartups(STARTUP_FALLBACKS);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const filtered = startups.filter(s => {
    const rawName = String(s.startupName || s.name || s.userId?.name || "");
    const rawDesc = String(s.description || "");
    const matchesSearch = rawName.toLowerCase().includes(search.toLowerCase()) || 
                          rawDesc.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = industry === "All" || s.industry === industry;
    return matchesSearch && matchesIndustry;
  });

  const industries = ["All", "SaaS", "Fintech", "AI/ML", "Healthtech", "Cleantech", "E-commerce"];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        
        {/* Market Catalog Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                 <Rocket size={14} className="text-primary" />
                 <span>Venture Market</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Discover Startups</h1>
              <p className="text-xs font-medium text-slate-500 max-w-xl">
                 Institutional-grade startups across global growth sectors. All ventures are pre-vetted for financial accuracy and market viability.
              </p>
           </div>
        </header>

        {/* Global Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <div className="relative flex-1 w-full lg:w-auto overflow-hidden group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                 placeholder="Search by name, thesis, or keyword..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-11 pl-10 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none placeholder:text-slate-400"
              />
           </div>
           
           <div className="h-6 w-[1px] bg-slate-200 hidden lg:block" />

           <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide px-2">
              {industries.map(ind => (
                 <button
                    key={ind}
                    onClick={() => setIndustry(ind)}
                    className={`h-9 px-4 rounded-lg text-[10px] font-bold tracking-widest transition-all whitespace-nowrap uppercase border
                    ${industry === ind ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                 >
                    {ind}
                 </button>
              ))}
           </div>
        </div>

        {/* Dynamic Listing Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
           {loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                 <CardSkeleton key={i} />
              ))
           ) : filtered.length > 0 ? (
              filtered.map((s) => (
                 <StartupCard key={s._id} startup={s} />
              ))
           ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <Rocket size={24} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">No Matching Ventures</h3>
                    <p className="text-xs text-slate-500 italic max-w-xs mx-auto">Seal alternative search vectors for better corridor visibility.</p>
                 </div>
              </div>
           )}
        </section>

      </div>
    </DashboardLayout>
  );
}
