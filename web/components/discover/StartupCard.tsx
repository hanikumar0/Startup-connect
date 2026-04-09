"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, TrendingUp, Bookmark, Star, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export default function StartupCard({ startup, isSavedInitial }: { startup: any, isSavedInitial?: boolean }) {
  const [isSaved, setIsSaved] = useState(isSavedInitial || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
      const res = await apiFetch("/api/save", {
        method: "POST",
        body: JSON.stringify({ targetId: startup._id, targetType: "startup" }),
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
      <div className="relative h-40 bg-zinc-50 overflow-hidden">
         <img 
            src={startup.logo || "/placeholder-startup.png"} 
            alt={startup.startupName} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
         />
         <Button 
            variant="ghost" 
            size="icon" 
            className={`absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white transition-all ${isSaved ? "text-amber-500 fill-amber-500" : "text-zinc-400"}`}
            onClick={handleSave}
            disabled={isSaving}
         >
            <Star className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
         </Button>
         <div className="absolute bottom-4 left-4 flex gap-2">
            <Badge className="bg-white/90 text-zinc-900 border-none backdrop-blur-md font-bold uppercase tracking-widest text-[9px]">{startup.stage}</Badge>
         </div>
      </div>
      
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
            <div>
                <h3 className="text-xl font-black text-zinc-900 line-clamp-1">{startup.startupName}</h3>
                <p className="text-sm font-medium text-indigo-600 mt-1">{startup.industry}</p>
            </div>
            
            <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                {startup.tagline || startup.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                    <MapPin className="h-3.5 w-3.5" /> {startup.location || "Remote"}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                    <TrendingUp className="h-3.5 w-3.5" /> ${(startup.fundingRequired || 0).toLocaleString()} target
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between">
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                   <div key={i} className="h-7 w-7 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-400">
                      U{i}
                   </div>
               ))}
               <div className="h-7 w-7 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                  +12
               </div>
            </div>
            <Button variant="ghost" className="text-indigo-600 font-black text-xs h-9 hover:bg-indigo-50 pr-0" asChild>
                <Link href={`/startup/${startup._id}`}>
                    VIEW DETAILS <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
