"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Clock, ArrowUpRight, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionButtonProps {
    status: "NONE" | "PENDING" | "ACCEPTED" | "REJECTED" | "RECEIVED_PENDING" | "REJECTED_RECENT";
    onConnect: () => void;
    onAccept: () => void;
    onReject: () => void;
    isLoading: boolean;
    className?: string;
}

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
    status,
    onConnect,
    onAccept,
    onReject,
    isLoading,
    className
}) => {
    // If loading, show a disabled state with a loader
    if (isLoading) {
        return (
            <Button disabled className={cn("flex-1 h-11 h-11 bg-indigo-600/50 text-white gap-2 font-black text-[10px] uppercase tracking-widest italic shadow-lg", className)}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
            </Button>
        );
    }

    // Handle different connection states
    switch (status) {
        case "ACCEPTED":
            return (
                <Button 
                    disabled 
                    variant="outline" 
                    className={cn("flex-1 h-11 bg-emerald-50 text-emerald-700 border-emerald-100 gap-2 font-black text-[10px] uppercase tracking-widest italic shadow-sm", className)}
                >
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                </Button>
            );

        case "PENDING":
            return (
                <div className={cn("flex flex-col flex-1 gap-1", className)}>
                    <Button 
                        disabled 
                        className="w-full h-11 bg-slate-100 text-slate-400 gap-2 border-none font-black text-[10px] uppercase tracking-widest italic"
                    >
                        <Clock className="h-4 w-4" />
                        Pending
                    </Button>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">Request Sent</span>
                </div>
            );

        case "RECEIVED_PENDING":
            return (
                <div className={cn("flex flex-1 gap-2", className)}>
                    <Button
                        onClick={onAccept}
                        className="flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest italic shadow-lg shadow-indigo-100"
                    >
                        Accept
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onReject}
                        className="flex-1 h-11 border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 font-black text-[10px] uppercase tracking-widest italic"
                    >
                        Reject
                    </Button>
                </div>
            );

        case "REJECTED_RECENT":
            return (
                <Button 
                    disabled 
                    className={cn("flex-1 h-11 bg-rose-50 text-rose-600 border border-rose-100 gap-2 font-black text-[10px] uppercase tracking-widest italic", className)}
                >
                    <XCircle className="h-4 w-4" />
                    Declined
                </Button>
            );

        case "NONE":
        case "REJECTED":
        default:
            return (
                <Button
                    onClick={onConnect}
                    className={cn("flex-1 h-11 bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-black text-[10px] uppercase tracking-widest italic shadow-lg shadow-indigo-100", className)}
                >
                    Connect
                    <ArrowUpRight className="h-3 w-3" />
                </Button>
            );
    }
};
