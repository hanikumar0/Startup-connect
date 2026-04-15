"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * /saved → redirects to /dashboard/saved
 * Keeping this route alive prevents any external links from 404-ing.
 */
export default function SavedRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard/saved");
    }, []);

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Redirecting…
                </p>
            </div>
        </div>
    );
}
