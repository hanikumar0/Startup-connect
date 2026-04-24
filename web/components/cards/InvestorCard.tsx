"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Bookmark, MapPin, DollarSign, MessageSquare, ChevronRight, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { WarmIntroModal } from "@/components/network/WarmIntroModal";
import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { apiFetchJSON } from "@/lib/api";
import { toast } from "sonner";

interface InvestorCardProps {
  investor: any;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export function InvestorCard({ investor, onSave, isSaved }: InvestorCardProps) {
  const { user } = useAuthStore();
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [startupProfile, setStartupProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.role === "startup") {
        fetchStartupProfile();
    }
  }, [user]);

  const fetchStartupProfile = async () => {
    try {
        const res = await apiFetchJSON("/api/startups/me");
        if (res.success) setStartupProfile(res.data);
    } catch (err) {}
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <WarmIntroModal 
        isOpen={isIntroOpen} 
        onClose={() => setIsIntroOpen(false)} 
        investor={investor} 
        startup={startupProfile}
      />
      <Card className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0 space-y-4">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-zinc-950 group-hover:text-white transition-all">
                {String(investor.investorName || investor.name || investor.userId?.name || 'I')[0]}
              </div>
              {investor.fitScore && (
                <Badge className={cn(
                    "h-6 px-2 text-[10px] font-bold border-none",
                    investor.fitScore >= 80 ? "bg-emerald-500 text-white" : 
                    investor.fitScore >= 60 ? "bg-indigo-500 text-white" : "bg-zinc-400 text-white"
                )}>
                    {investor.fitScore}% Fit
                </Badge>
              )}
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSave?.(investor._id)}
                className={cn("h-8 w-8 rounded-full", isSaved ? "text-indigo-600 bg-indigo-50" : "text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50")}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
          </div>

          {/* Middle Section */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">{investor.investorName || investor.name || investor.userId?.name || "Unknown Investor"}</h3>
            <div className="flex items-center gap-2">
                 <Briefcase size={12} className="text-zinc-400" />
                 <p className="text-sm text-zinc-500 font-medium">{investor.firmName || "Private Allocator"}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 bg-zinc-50 border-zinc-100 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
              {investor.investorType || 'VC'}
            </Badge>
            {investor.preferredIndustries?.slice(0, 1).map((ind: string) => (
                <Badge key={ind} variant="outline" className="rounded-full px-3 py-1 bg-zinc-50 border-zinc-100 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                    {ind}
                </Badge>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="pt-4 border-t border-zinc-50 flex items-center justify-between text-xs font-medium text-zinc-500">
            <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-indigo-500" />
                <span>{investor.checkSize || 'Multi-stage'}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin size={14} className="text-zinc-400" />
                <span>{investor.location || 'Global'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 gap-2 pt-4">
             <Button asChild variant="outline" className="h-10 rounded-xl border-zinc-200 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all">
                 <Link href={`/investor/${investor._id}`}>
                    Analyze Brief
                 </Link>
             </Button>
             <div className="grid grid-cols-2 gap-2">
                {user?.role === "startup" && (
                    <Button 
                        variant="outline" 
                        onClick={() => setIsIntroOpen(true)}
                        className="h-10 rounded-xl border-indigo-100 bg-indigo-50/30 text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                        Warm Intro
                    </Button>
                )}
                <div className="grid grid-cols-3 gap-2">
                    <Button 
                        variant="outline"
                        onClick={async () => {
                            try {
                                const res = await apiFetchJSON("/api/crm/add", {
                                    method: "POST",
                                    body: JSON.stringify({ targetId: investor._id })
                                });
                                if (res.success) toast.success("Added to Fundraising CRM");
                            } catch (err) {
                                toast.error("Failed to add to CRM");
                            }
                        }}
                        className="h-10 rounded-xl border-zinc-100 bg-zinc-50 text-zinc-600 font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-950 hover:text-white transition-all shadow-sm"
                    >
                        CRM
                    </Button>
                    <Button className={cn("h-10 rounded-xl bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all", user?.role === "startup" ? "col-span-2" : "col-span-3")}>
                        Connect
                    </Button>
                 </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
