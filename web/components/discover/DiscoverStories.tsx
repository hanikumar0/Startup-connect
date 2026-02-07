"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Play } from "lucide-react";
import { motion } from "framer-motion";

export function DiscoverStories() {
    return (
        <div className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-2 group cursor-pointer shrink-0">
                <div className="relative">
                    <div className="h-20 w-20 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/50">
                        <Plus className="h-6 w-6 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Post Pulse</span>
            </div>

            <div className="flex items-center justify-center border-l border-slate-100 pl-6 h-20">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">No Active Pulses</p>
            </div>
        </div>
    );
}
