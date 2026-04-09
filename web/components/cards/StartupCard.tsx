"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Bookmark, MapPin, DollarSign, MessageSquare, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StartupCardProps {
  startup: any;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export function StartupCard({ startup, onSave, isSaved }: StartupCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm hover:shadow-lg transition-all duration-300">
        <CardContent className="p-0 space-y-4">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div className="h-10 w-10 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 font-bold group-hover:bg-zinc-950 group-hover:text-white transition-all">
              {String(startup.startupName || startup.name || startup.userId?.name || 'S')[0]}
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onSave?.(startup._id)}
                className={cn("h-8 w-8 rounded-full", isSaved ? "text-indigo-600 bg-indigo-50" : "text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50")}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
          </div>

          {/* Middle Section */}
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors uppercase italic">{startup.startupName || startup.name || startup.userId?.name || "Anonymous Venture"}</h3>
            <p className="text-sm text-zinc-500 font-medium italic line-clamp-2 min-h-[40px]">
              {startup.tagline || startup.description || "Synthesizing next-gen venture signal."}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 bg-zinc-50 border-zinc-100 text-[10px] font-bold uppercase tracking-widest italic text-zinc-600">
              {startup.industry || 'Tech'}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 bg-zinc-50 border-zinc-100 text-[10px] font-bold uppercase tracking-widest italic text-zinc-600">
              {startup.stage || 'Seed'}
            </Badge>
          </div>

          {/* Bottom Section */}
          <div className="pt-4 border-t border-zinc-50 flex items-center justify-between text-xs font-bold text-zinc-400 italic">
            <div className="flex items-center gap-2">
                <DollarSign size={14} className="text-indigo-500" />
                <span className="uppercase tracking-widest text-[9px]">{startup.fundingRequired ? `$${(startup.fundingRequired/1000).toFixed(0)}k` : 'Private'}</span>
            </div>
            <div className="flex items-center gap-2">
                <MapPin size={14} className="text-zinc-400" />
                <span className="uppercase tracking-widest text-[9px]">{startup.location || 'Remote'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
             <Button asChild variant="outline" className="h-10 rounded-lg border-zinc-200 font-bold italic uppercase tracking-widest text-[10px] hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-950">
                 <Link href={`/startup/${startup._id}`}>
                    View Brief
                 </Link>
             </Button>
             <Button variant="outline" className="h-10 rounded-lg border-zinc-200 font-bold italic uppercase tracking-widest text-[10px] hover:bg-zinc-900 hover:text-white transition-all group-hover:border-zinc-950">
                 Message
             </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
