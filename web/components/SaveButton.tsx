"use client";

import { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { apiFetchJSON, clearApiCache } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SaveButtonProps {
    targetId: string;
    targetType: "startup" | "investor" | "meeting";
    title?: string;
    description?: string;
    /** compact = icon only, full = icon + text */
    variant?: "compact" | "full";
    className?: string;
    /** Optional: initial saved state to avoid initial API call */
    initialSaved?: boolean;
    onSaveChange?: (saved: boolean) => void;
}

/**
 * SaveButton — drop-in bookmark toggle for any startup/investor/meeting card.
 * Usage:
 *   <SaveButton targetId={startup._id} targetType="startup" title={startup.name} />
 */
export default function SaveButton({
    targetId,
    targetType,
    title = "",
    description = "",
    variant = "compact",
    className = "",
    initialSaved,
    onSaveChange,
}: SaveButtonProps) {
    const { user } = useAuthStore();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState<boolean>(initialSaved ?? false);
    const [loading, setLoading] = useState(false);

    // If initialSaved not provided, check status on mount
    useEffect(() => {
        if (initialSaved !== undefined) return;
        if (!user || !targetId) return;

        // We don't have a dedicated "check saved" endpoint so we skip the lookup —
        // the parent should pass initialSaved if possible.
    }, [targetId, user]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please log in to save items.");
            router.push("/login");
            return;
        }

        setLoading(true);
        const nextState = !isSaved;
        setIsSaved(nextState); // optimistic

        try {
            const res = await apiFetchJSON("/api/save", {
                method: "POST",
                body: JSON.stringify({ targetId, targetType, title, description }),
            });

            if (res.success) {
                clearApiCache();
                const didSave = res.saved;
                setIsSaved(didSave);
                toast.success(
                    didSave
                        ? `✅ Saved to your collection!`
                        : `Removed from saved items.`,
                    { duration: 2000 }
                );
                onSaveChange?.(didSave);
            } else {
                setIsSaved(!nextState); // revert
                toast.error(res.message || "Failed to update saved status.");
            }
        } catch {
            setIsSaved(!nextState); // revert
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (variant === "full") {
        return (
            <button
                onClick={handleToggle}
                disabled={loading}
                className={`flex items-center gap-2 h-9 px-4 rounded-xl border font-black text-[11px] uppercase tracking-widest transition-all ${
                    isSaved
                        ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100"
                        : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                } ${className}`}
                title={isSaved ? "Remove from saved" : "Save"}
            >
                {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                ) : (
                    <Bookmark
                        size={13}
                        fill={isSaved ? "currentColor" : "none"}
                        className="transition-all"
                    />
                )}
                {isSaved ? "Saved" : "Save"}
            </button>
        );
    }

    // compact (icon only)
    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all ${
                isSaved
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 hover:bg-indigo-700"
                    : "bg-white border-slate-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-500"
            } ${className}`}
            title={isSaved ? "Remove from saved" : "Save to collection"}
        >
            {loading ? (
                <Loader2 size={13} className="animate-spin" />
            ) : (
                <Bookmark
                    size={13}
                    fill={isSaved ? "currentColor" : "none"}
                    className="transition-transform hover:scale-110"
                />
            )}
        </button>
    );
}
