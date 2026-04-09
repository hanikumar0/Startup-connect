"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Bookmark, MapPin, DollarSign, MessageSquare, ChevronRight, User, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface InvestorCardProps {
  investor: any;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export function InvestorCard({ investor, onSave, isSaved }: InvestorCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0 space-y-4">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-zinc-950 group-hover:text-white transition-all">
              {String(investor.investorName || investor.name || investor.userId?.name || 'I')[0]}
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
          <div className="grid grid-cols-2 gap-3 pt-4">
             <Button asChild variant="outline" className="h-10 rounded-lg border-zinc-200 font-semibold hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-950">
                 <Link href={`/investor/${investor._id}`}>
                    View Profile
                 </Link>
             </Button>
             <Button variant="outline" className="h-10 rounded-lg border-zinc-200 font-semibold hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-950">
                 Connect
             </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
