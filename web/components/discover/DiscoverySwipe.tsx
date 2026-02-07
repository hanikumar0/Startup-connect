"use client";

import React, { useState, useEffect } from "react";
import { TinderCard } from "./TinderCard";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscoverySwipeProps {
    profiles: any[];
    onConnect: (id: string) => void;
    isLoading: boolean;
    roleToFind: string;
}

export const DiscoverySwipe: React.FC<DiscoverySwipeProps> = ({ profiles, onConnect, isLoading, roleToFind }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stack, setStack] = useState<any[]>([]);

    const [lastDirection, setLastDirection] = useState<"left" | "right" | null>(null);

    useEffect(() => {
        setStack(profiles);
    }, [profiles]);

    const handleSwipe = (direction: "left" | "right") => {
        setLastDirection(direction);
        const profile = stack[currentIndex];
        if (direction === "right") {
            onConnect(profile.userId._id);
        }
        setCurrentIndex((prev) => prev + 1);
    };

    const handleReset = () => {
        setCurrentIndex(0);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] w-full bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                <p className="text-slate-500 font-medium">Finding perfect {roleToFind} for you...</p>
            </div>
        );
    }

    if (currentIndex >= stack.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] w-full bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200 text-center px-8">
                <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                    <Sparkles className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">That's everyone for now!</h3>
                <p className="text-slate-500 mb-8 max-w-xs">You've swiped through all available {roleToFind.toLowerCase()}. Check back later for more.</p>
                <Button onClick={handleReset} variant="outline" className="rounded-full h-12 px-8 gap-2 border-slate-200">
                    <RefreshCcw className="h-4 w-4" />
                    Start Over
                </Button>
            </div>
        );
    }

    return (
        <div className="relative h-[650px] w-full max-w-[400px] mx-auto flex items-center justify-center perspective-[1000px]">
            {/* Simple background decorative element */}
            <div className="absolute inset-0 bg-indigo-50/50 rounded-full blur-3xl -z-10 animate-pulse" />

            <AnimatePresence mode="popLayout">
                {stack.slice(currentIndex, currentIndex + 3).reverse().map((profile, index) => {
                    const stackIndex = index + currentIndex;
                    const isTop = stackIndex === currentIndex;

                    return (
                        <motion.div
                            key={profile._id}
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{
                                scale: isTop ? 1 : 0.9 + (0.05 * index),
                                y: isTop ? 0 : 20 - (10 * index),
                                opacity: 1,
                                zIndex: index
                            }}
                            exit={{ x: lastDirection === "right" ? 500 : -500, opacity: 0, rotate: lastDirection === "right" ? 45 : -45 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ position: "absolute", width: "100%", pointerEvents: isTop ? "auto" : "none" }}
                        >
                            <TinderCard
                                profile={profile}
                                onSwipe={handleSwipe}
                                onViewDetail={() => { }}
                                active={isTop}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};
