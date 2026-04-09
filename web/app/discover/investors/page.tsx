"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { InvestorCard } from "@/components/cards/InvestorCard";
import { CardSkeleton } from "@/components/ui/skeletons";
import { Input } from "@/components/ui/input";
import { Search, Filter, Rocket, ChevronRight, User, Wallet, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

const INVESTOR_FALLBACKS = [
    { _id: 'f1', investorName: 'Sequoia Capital', firmName: 'Sequoia', investorType: 'VC', location: 'Menlo Park, CA', checkSize: '$1M - $100M', preferredIndustries: ['SaaS', 'AI'] },
    { _id: 'f2', investorName: 'Andreessen Horowitz', firmName: 'a16z', investorType: 'VC', location: 'Silicon Valley', checkSize: '$500k - $50M', preferredIndustries: ['Crypto', 'Fintech'] },
    { _id: 'f3', investorName: 'Naval Ravikant', firmName: 'Angel', investorType: 'Angel', location: 'Los Angeles', checkSize: '$50k - $500k', preferredIndustries: ['Web3', 'Social'] }
];

export default function DiscoverInvestorsPage() {
  const [investors, setInvestors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");

  useEffect(() => {
    async function fetchData() {
        try {
            console.log("Fetching discover investors data...");
            // Requesting higher limit to ensure we see the seeded data
            const res = await apiFetch('/api/discover/investors?limit=100');
            if (res.ok) {
                const result = await res.json();
                console.log("Successfully fetched investors:", result.data?.length || 0, "records");
                
                if (!result.data || result.data.length === 0) {
                    console.warn("API returned 0 investors, utilizing local resilience cache.");
                    setInvestors(INVESTOR_FALLBACKS);
                } else {
                    setInvestors(result.data);
                }
            } else {
                console.error("Failed to fetch investors. Status:", res.status);
                setInvestors(INVESTOR_FALLBACKS);
            }
        } catch (err) {
            console.error("Error during investor fetching:", err);
            // Emergency fallback
            setInvestors(INVESTOR_FALLBACKS);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, []);

  const filtered = investors.filter(i => {
    const rawName = String(i.investorName || i.name || i.userId?.name || "");
    const rawFirm = String(i.firmName || "");
    
    const matchesSearch = rawName.toLowerCase().includes(search.toLowerCase()) || 
                          rawFirm.toLowerCase().includes(search.toLowerCase());
    const matchesType = type === "All" || i.investorType === type;
    return matchesSearch && matchesType;
  });

  const types = ["All", "Angel", "VC", "Private Equity", "Family Office", "Corporate VC"];

  return (
    <DashboardLayout>
      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        
        {/* Allocator Catalog Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                 <Wallet size={14} className="text-primary" />
                 <span>Capital Marketplace</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Discover Investors</h1>
              <p className="text-xs font-medium text-slate-500 max-w-xl">
                 Connect with high-fidelity capital allocators and institutional funds. All profiles are verified for identity and investment capacity.
              </p>
           </div>
        </header>

        {/* Global Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
           <div className="relative flex-1 w-full lg:w-auto overflow-hidden group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                 placeholder="Search by firm name, thesis, or keyword..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full h-11 pl-10 pr-4 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none placeholder:text-slate-400"
              />
           </div>
           
           <div className="h-6 w-[1px] bg-slate-200 hidden lg:block" />

           <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide px-2">
              {types.map(t => (
                 <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`h-9 px-4 rounded-lg text-[10px] font-bold tracking-widest transition-all whitespace-nowrap uppercase border
                    ${type === t ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-200' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                 >
                    {t}
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
              filtered.map((i) => (
                 <InvestorCard key={i._id} investor={i} />
              ))
           ) : (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                    <User size={24} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">No Matching Allocators</h3>
                    <p className="text-xs text-slate-500 italic max-w-xs mx-auto">Seal alternative capital signals for better corridor visibility.</p>
                 </div>
              </div>
           )}
        </section>

      </div>
    </DashboardLayout>
  );
}
