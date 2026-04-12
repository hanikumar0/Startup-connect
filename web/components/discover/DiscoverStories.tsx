"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Play } from "lucide-react";
import { motion } from "framer-motion";

export function DiscoverStories() {
    return (
        <div className="flex items-center gap-10 overflow-x-auto no-scrollbar">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/50">
                        <Plus className="h-5 w-5 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-1">Post Pulse</span>
            </div>

            <div className="flex flex-col items-start gap-1">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] italic">No active pulses</p>
            </div>
        </div>
    );
}
