"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Zap, ShieldCheck, ChevronRight, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MatchCardProps {
  match: any;
  onConnect?: (id: string) => void;
}

export function MatchCard({ match, onConnect }: MatchCardProps) {
  const score = Math.round(match.matchScore || 85);
  const name = match.startup?.name || match.investor?.name || "Strategic Entity";
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="rounded-xl border border-zinc-100 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
            <Target size={150} className="text-indigo-500" />
        </div>
        
        <CardContent className="p-0 space-y-6 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black italic shadow-lg shadow-indigo-500/20">
                    {name[0]}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black italic tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase uppercase-italic">{name}</span>
                    <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">{match.startup?.industry || match.investor?.investorType || 'Strategic Alignment'}</span>
                 </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-2 mb-1 justify-end">
                    <Zap size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-lg font-black italic tracking-tighter text-zinc-900 leading-none">{score}%</span>
                </div>
                <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest leading-none">SIGNAL ACCURACY</span>
            </div>
          </div>

          <p className="text-xs font-bold text-zinc-500 italic line-clamp-2 leading-relaxed h-[36px]">
              {match.startup?.tagline || match.reasoning || "High-probability venture alignment detected across current institutional thematic corridors."}
          </p>

          <div className="flex gap-2">
               <Badge variant="outline" className="rounded-full px-3 py-1 bg-emerald-50 border-emerald-100 text-[9px] font-black uppercase tracking-widest italic text-emerald-600">
                   {match.matchReason || 'Highly Compatible'}
               </Badge>
          </div>

          <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
              <Button variant="ghost" className="h-9 px-4 rounded-xl hover:bg-zinc-50 font-bold italic text-[10px] uppercase text-zinc-400 hover:text-zinc-900 transition-all">VIEW SIGNAL</Button>
              <Button onClick={() => onConnect?.(match._id)} className="h-9 px-6 rounded-xl bg-zinc-950 text-white font-black italic text-[10px] uppercase shadow-xl hover:shadow-zinc-200 transition-all flex items-center gap-2">
                 INITIALIZE CHANNEL <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
