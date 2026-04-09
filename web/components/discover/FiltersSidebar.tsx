"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Filter, X, Search, ChevronDown, Rocket, Briefcase, MapPin, DollarSign, Target } from "lucide-react";

interface FiltersSidebarProps {
  type: "startups" | "investors";
  onFilterChange: (filters: any) => void;
  onClear: () => void;
}

const INDUSTRIES = ["AI", "SaaS", "Fintech", "EdTech", "HealthTech", "ClimateTech", "Marketplace", "Web3"];
const STAGES = ["Idea", "MVP", "Revenue", "Growth", "Series A", "Series B"];
const INVESTOR_TYPES = ["Angel", "VC", "Micro VC", "Family Office", "Accelerator"];

export default function FiltersSidebar({ type, onFilterChange, onClear }: FiltersSidebarProps) {
  const [filters, setFilters] = useState<any>({
    industry: "",
    stage: "",
    type: "",
    location: "",
    minFunding: "",
  });

  const handleUpdate = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAll = () => {
    const cleared = { industry: "", stage: "", type: "", location: "", minFunding: "" };
    setFilters(cleared);
    onClear();
  };

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-8 max-h-[calc(100vh-120px)] lg:sticky top-24 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Filter className="h-4 w-4" /> FILTERS
        </h3>
        <Button variant="ghost" size="sm" className="text-zinc-400 font-bold text-[10px] uppercase h-7 px-2 hover:text-indigo-600" onClick={clearAll}>
            Clear All
        </Button>
      </div>

      <div className="space-y-6 pt-2">
        {/* Industry Filter */}
        <div className="space-y-4">
            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Briefcase className="h-3 w-3" /> Industry</Label>
            <div className="space-y-2">
                {INDUSTRIES.map(industry => (
                    <div key={industry} className="flex items-center gap-3 group cursor-pointer" onClick={() => handleUpdate("industry", filters.industry === industry ? "" : industry)}>
                        <div className={`h-5 w-5 rounded border flex items-center justify-center transition-all ${filters.industry === industry ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-200 group-hover:border-indigo-300"}`}>
                            {filters.industry === industry && <Rocket className="h-3 w-3 fill-current" />}
                        </div>
                        <span className={`text-sm font-medium transition-colors ${filters.industry === industry ? "text-indigo-600 font-bold" : "text-zinc-600 group-hover:text-zinc-900"}`}>{industry}</span>
                    </div>
                ))}
            </div>
        </div>

        <Separator className="bg-zinc-100" />

        {/* Stage Filter */}
        <div className="space-y-4">
            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Target className="h-3 w-3" /> Stage</Label>
            <div className="grid grid-cols-2 gap-2">
                {STAGES.map(stage => (
                    <Button 
                        key={stage} 
                        variant="outline" 
                        className={`h-9 text-[11px] font-bold border-zinc-100 rounded-xl transition-all ${filters.stage === stage ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "hover:border-indigo-200 hover:text-indigo-600 text-zinc-500"}`}
                        onClick={() => handleUpdate("stage", filters.stage === stage ? "" : stage)}
                    >
                        {stage}
                    </Button>
                ))}
            </div>
        </div>

        <Separator className="bg-zinc-100" />

        {/* Type Filter (for investors) */}
        {type === "investors" && (
           <>
            <div className="space-y-4">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Investor Type</Label>
                <div className="space-y-2">
                    {INVESTOR_TYPES.map(t => (
                        <div key={t} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleUpdate("type", filters.type === t ? "" : t)}>
                            <div className={`h-5 w-5 rounded-full border transition-all ${filters.type === t ? "bg-indigo-600 border-indigo-600" : "border-zinc-200 hover:border-indigo-300"}`} />
                            <span className={`text-sm font-medium ${filters.type === t ? "text-indigo-600 font-bold" : "text-zinc-600 group-hover:text-zinc-900"}`}>{t}</span>
                        </div>
                    ))}
                </div>
            </div>
            <Separator className="bg-zinc-100" />
           </>
        )}

        {/* Location Filter */}
        <div className="space-y-4">
            <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3" /> Location</Label>
            <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 group-focus-within:text-indigo-600" />
                <Input 
                    placeholder="Search city/country..." 
                    className="pl-9 h-10 border-zinc-100 rounded-xl focus:ring-4 focus:ring-indigo-50 transition-all text-xs font-medium" 
                    value={filters.location}
                    onChange={(e) => handleUpdate("location", e.target.value)}
                />
            </div>
        </div>

        {/* Min Funding Filter (for startups) */}
        {type === "startups" && (
            <div className="space-y-4">
                <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2"><DollarSign className="h-3 w-3" /> Min Funding ($)</Label>
                <Input 
                    type="number" 
                    placeholder="e.g. 100000" 
                    className="h-10 border-zinc-100 rounded-xl text-xs font-medium" 
                    value={filters.minFunding}
                    onChange={(e) => handleUpdate("minFunding", e.target.value)}
                />
            </div>
        )}
      </div>

      <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
         <div className="relative z-10 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[2px] opacity-80">AI Matching</p>
            <h4 className="text-sm font-black leading-tight">Get personalized matches based on your profile</h4>
            <Button size="sm" className="bg-white text-indigo-600 hover:bg-zinc-100 font-black text-[10px] tracking-widest h-8 w-full rounded-xl">UPGRADE NOW</Button>
         </div>
         <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      </div>
    </aside>
  );
}
