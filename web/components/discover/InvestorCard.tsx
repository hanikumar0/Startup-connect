"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Coins, Briefcase, Star, ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export default function InvestorCard({ investor, isSavedInitial }: { investor: any, isSavedInitial?: boolean }) {
  const [isSaved, setIsSaved] = useState(isSavedInitial || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      const res = await apiFetch("/api/save", {
        method: "POST",
        body: JSON.stringify({ targetId: investor._id, targetType: "investor" }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(data.saved);
        toast.success(data.message);
      }
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-3xl h-full flex flex-col">
       <CardContent className="p-8 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div className="h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-2">
                <img 
                    src={investor.logo || "/placeholder-investor.png"} 
                    alt={investor.investorName} 
                    className="max-h-full max-w-full object-contain"
                />
             </div>
             <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full hover:bg-zinc-50 transition-all ${isSaved ? "text-amber-500 fill-amber-500" : "text-zinc-200"}`}
                onClick={handleSave}
                disabled={isSaving}
             >
                <Star className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
             </Button>
          </div>

          <div className="flex-1 space-y-4">
             <div className="space-y-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-xl font-black text-zinc-900 line-clamp-1">{investor.investorName}</h3>
                   <ShieldCheck className="h-4 w-4 text-blue-500 fill-blue-50" />
                </div>
                <p className="text-sm font-bold text-indigo-600 uppercase tracking-tight">{investor.firmName}</p>
             </div>

             <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed font-medium">
                {investor.bio}
             </p>

             <div className="flex flex-wrap gap-2 pt-2">
                {investor.preferredIndustries?.slice(0, 3).map((industry: string) => (
                    <Badge key={industry} variant="secondary" className="bg-zinc-50 text-zinc-500 border-none px-2 py-0.5 text-[10px] font-bold">{industry}</Badge>
                ))}
                {investor.preferredIndustries?.length > 3 && <Badge variant="secondary" className="bg-zinc-50 text-zinc-500 border-none px-2 py-0.5 text-[10px] font-bold">+{investor.preferredIndustries.length - 3}</Badge>}
             </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Coins className="h-3 w-3" /> Check Size</p>
                <p className="text-sm font-black text-zinc-900">${(investor.checkSizeMax / 1000).toLocaleString()}k max</p>
             </div>
             <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" /> Location</p>
                <p className="text-sm font-black text-zinc-900 line-clamp-1">{investor.location || "Global"}</p>
             </div>
          </div>

          <Button className="w-full mt-6 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs h-11 tracking-widest rounded-xl" asChild>
             <Link href={`/investor/${investor._id}`}>VIEW PROFILE</Link>
          </Button>
       </CardContent>
    </Card>
  );
}
