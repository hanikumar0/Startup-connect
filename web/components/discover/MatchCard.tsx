"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
    CheckCircle2, 
    ArrowUpRight, 
    Zap, 
    MapPin, 
    Target, 
    Coins, 
    ShieldCheck 
} from "lucide-react";
import Link from "next/link";

interface MatchCardProps {
  match: {
    score: number;
    reasons: string[];
    investor?: any;
    startup?: any;
  };
  type: "investor" | "startup";
}

export default function MatchCard({ match, type }: MatchCardProps) {
  const entity = type === "investor" ? match.investor : match.startup;
  const name = type === "investor" ? entity.investorName : entity.startupName;
  const subName = type === "investor" ? entity.firmName : entity.industry;
  const link = type === "investor" ? `/investor/${entity._id}` : `/startup/${entity._id}`;

  return (
    <Card className="rounded-lg border-border shadow-none bg-white hover:border-slate-300 transition-all group overflow-hidden">
      <CardContent className="p-6 space-y-6">
        
        {/* Header: Score & Logo */}
        <div className="flex justify-between items-start">
            <div className="px-2.5 py-1 rounded-md bg-primary/5 text-primary text-xs font-bold border border-primary/10 tracking-wide">
                {match.score}% MATCH
            </div>
            <div className="h-10 w-10 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                <img src={entity.logo || "/placeholder.png"} alt={name} className="max-h-full max-w-full object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
            </div>
        </div>

        {/* Content: Identity */}
        <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{name}</h3>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
               <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{subName}</p>
            </div>
        </div>

        {/* Detailed Reasons */}
        <div className="space-y-2 border-t border-slate-50 pt-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matching Signals</p>
            <div className="space-y-2">
                {match.reasons.slice(0, 2).map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                        <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-600 leading-snug font-medium">
                            {reason}
                        </p>
                    </div>
                ))}
            </div>
        </div>

        {/* Footer: Metrics & Action */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-2">
             <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {type === "investor" ? "Typical Max Check" : "Target Raising"}
                </span>
                <p className="text-md font-bold text-slate-900">
                    ${type === "investor" ? (entity.checkSizeMax / 1000).toLocaleString() + "k" : (entity.fundingRequired / 1000).toLocaleString() + "k"}
                </p>
             </div>
             <Link href={link}>
                <Button variant="outline" className="h-9 px-4 rounded-md text-xs font-bold border-slate-200 text-slate-900 hover:bg-slate-50">
                    View Details
                </Button>
             </Link>
        </div>
      </CardContent>
    </Card>
  );
}
