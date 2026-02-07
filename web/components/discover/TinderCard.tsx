"use client";

import React, { useState } from "react";
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    X,
    Heart,
    Info,
    Building2,
    User,
    ShieldCheck,
    Globe,
    Zap,
    MapPin,
    Target
} from "lucide-react";

interface TinderCardProps {
    profile: any;
    onSwipe: (direction: "left" | "right") => void;
    onViewDetail: (profile: any) => void;
    active: boolean;
}

export const TinderCard: React.FC<TinderCardProps> = ({ profile, onSwipe, onViewDetail, active }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipe("right");
        } else if (info.offset.x < -100) {
            onSwipe("left");
        }
    };

    if (!active) return null;

    const displayName = profile.companyName || profile.firmName || profile.userId?.name;
    const role = profile.userId?.role;

    return (
        <motion.div
            style={{ x, rotate, position: "absolute", width: "100%", maxWidth: "400px", zIndex: 10 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 1.05 }}
            className="cursor-grab active:cursor-grabbing"
        >
            <Card className="relative h-[550px] w-full overflow-hidden border-none shadow-2xl rounded-[2rem] bg-white">
                {/* Visual Indicators for Like/Nope */}
                <motion.div
                    style={{ opacity: likeOpacity }}
                    className="absolute top-10 left-10 z-20 border-4 border-emerald-500 rounded-lg px-4 py-2 rotate-[-20deg]"
                >
                    <span className="text-3xl font-black text-emerald-500 uppercase">Connect</span>
                </motion.div>
                <motion.div
                    style={{ opacity: nopeOpacity }}
                    className="absolute top-10 right-10 z-20 border-4 border-rose-500 rounded-lg px-4 py-2 rotate-[20deg]"
                >
                    <span className="text-3xl font-black text-rose-500 uppercase">Skip</span>
                </motion.div>

                {/* Profile Image / Initials Placeholder */}
                <div className="h-2/3 w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex flex-col items-center justify-center text-white relative">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="h-32 w-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl mb-6">
                        {role === "STARTUP" ? <Building2 className="h-16 w-16" /> : <User className="h-16 w-16" />}
                    </div>
                    <div className="text-center z-10 w-full px-4">
                        <h2 className="text-3xl font-bold mb-2 truncate leading-tight">{displayName}</h2>
                        <div className="flex items-center justify-center gap-2">
                            <Badge className="bg-white/20 border-none text-white backdrop-blur-sm">
                                {profile.industry || profile.investorType || "General"}
                            </Badge>
                            {profile.userId?.verificationStatus === "VERIFIED" && (
                                <Badge className="bg-emerald-500/80 border-none text-white backdrop-blur-sm flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" />
                                    Verified
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Overlay */}
                <CardContent className="absolute bottom-0 w-full p-8 bg-white/95 backdrop-blur-md h-1/3 flex flex-col justify-between rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1.5">
                                <Target className="h-4 w-4 text-indigo-500" />
                                {profile.fundingStage || (profile.minInvestment ? `$${(profile.minInvestment / 1000).toFixed(0)}k+` : "Seed")}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-indigo-500" />
                                India
                            </span>
                        </div>
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed italic">
                            "{profile.description || profile.bio || "Looking to grow and scale innovative solutions."}"
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => onSwipe("left")}
                            className="h-14 w-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-rose-500 shadow-lg hover:bg-rose-50 transition-colors"
                        >
                            <X className="h-6 w-6 stroke-[3]" />
                        </button>
                        <button
                            onClick={() => onViewDetail(profile)}
                            className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                            <Info className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => onSwipe("right")}
                            className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-colors"
                        >
                            <Heart className="h-6 w-6 fill-current" />
                        </button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
