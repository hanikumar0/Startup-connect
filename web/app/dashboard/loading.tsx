import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative flex items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full border border-indigo-100 animate-ping" />
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                    <Loader2 className="h-6 w-6 text-indigo-600/30 animate-spin" />
                </div>
            </div>
            <div className="flex flex-col items-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1 italic">Reach.Hub Intelligence</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                    <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter italic">Initializing Neural Link...</span>
                </div>
            </div>
        </div>
    );
}
